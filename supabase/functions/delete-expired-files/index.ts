import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExpiredFile {
  id: string;
  storage_path: string;
  user_id: string;
  file_size: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting auto-deletion of expired Basic plan files...');

    // Get all files from Basic users that are older than 24 hours
    const { data: expiredFiles, error: fetchError } = await supabaseClient
      .from('files')
      .select('id, storage_path, user_id, file_size, profiles!inner(subscription_tier)')
      .eq('profiles.subscription_tier', 'basic')
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (fetchError) {
      console.error('Error fetching expired files:', fetchError);
      throw fetchError;
    }

    if (!expiredFiles || expiredFiles.length === 0) {
      console.log('No expired files found');
      return new Response(
        JSON.stringify({ message: 'No expired files to delete', deleted: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${expiredFiles.length} expired files to delete`);

    let deletedCount = 0;
    const errors: string[] = [];

    // Process each expired file
    for (const file of expiredFiles as unknown as ExpiredFile[]) {
      try {
        // Delete from storage
        const { error: storageError } = await supabaseClient.storage
          .from('files')
          .remove([file.storage_path]);

        if (storageError) {
          console.warn(`Storage deletion failed for ${file.id}:`, storageError);
          errors.push(`Storage: ${file.id} - ${storageError.message}`);
        }

        // Delete from database
        const { error: dbError } = await supabaseClient
          .from('files')
          .delete()
          .eq('id', file.id);

        if (dbError) {
          console.error(`Database deletion failed for ${file.id}:`, dbError);
          errors.push(`DB: ${file.id} - ${dbError.message}`);
          continue;
        }

        // Update storage usage
        const { error: updateError } = await supabaseClient.rpc('update_storage_after_deletion', {
          p_user_id: file.user_id,
          p_file_size: file.file_size
        });

        if (updateError) {
          console.warn(`Storage usage update failed for user ${file.user_id}:`, updateError);
        }

        deletedCount++;
        console.log(`Successfully deleted file ${file.id}`);
      } catch (err) {
        console.error(`Error processing file ${file.id}:`, err);
        errors.push(`Processing: ${file.id} - ${err.message}`);
      }
    }

    console.log(`Auto-deletion complete. Deleted ${deletedCount}/${expiredFiles.length} files`);

    return new Response(
      JSON.stringify({
        message: 'Auto-deletion completed',
        deleted: deletedCount,
        total: expiredFiles.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Fatal error in delete-expired-files:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
