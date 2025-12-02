import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

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

interface ProfileWithFiles {
  id: string;
  subscription_tier: string;
  subscription_end_date: string | null;
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

    console.log('Starting auto-deletion of expired files...');

    const now = new Date();
    let deletedCount = 0;
    const errors: string[] = [];

    // === BASIC PLAN: Delete files older than 2 days ===
    const basicCutoff = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: basicExpiredFiles, error: basicFetchError } = await supabaseClient
      .from('files')
      .select('id, storage_path, user_id, file_size, profiles!inner(subscription_tier)')
      .eq('profiles.subscription_tier', 'basic')
      .lt('created_at', basicCutoff);

    if (basicFetchError) {
      console.error('Error fetching Basic plan expired files:', basicFetchError);
      errors.push(`Basic fetch error: ${basicFetchError.message}`);
    } else if (basicExpiredFiles && basicExpiredFiles.length > 0) {
      console.log(`Found ${basicExpiredFiles.length} Basic plan files to delete (older than 2 days)`);
      
      for (const file of basicExpiredFiles as unknown as ExpiredFile[]) {
        try {
          // Delete from storage
          const { error: storageError } = await supabaseClient.storage
            .from('files')
            .remove([file.storage_path]);

          if (storageError) {
            console.warn(`Storage deletion failed for ${file.id}:`, storageError);
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
          await supabaseClient.rpc('update_storage_after_deletion', {
            p_user_id: file.user_id,
            p_file_size: file.file_size
          });

          deletedCount++;
          console.log(`Deleted Basic file ${file.id}`);
        } catch (err: any) {
          console.error(`Error processing Basic file ${file.id}:`, err);
          errors.push(`Processing: ${file.id} - ${err.message}`);
        }
      }
    }

    // === FREE PLAN: Delete files older than 2 days (same as Basic) ===
    const { data: freeExpiredFiles, error: freeFetchError } = await supabaseClient
      .from('files')
      .select('id, storage_path, user_id, file_size, profiles!inner(subscription_tier)')
      .eq('profiles.subscription_tier', 'free')
      .lt('created_at', basicCutoff);

    if (freeFetchError) {
      console.error('Error fetching Free plan expired files:', freeFetchError);
      errors.push(`Free fetch error: ${freeFetchError.message}`);
    } else if (freeExpiredFiles && freeExpiredFiles.length > 0) {
      console.log(`Found ${freeExpiredFiles.length} Free plan files to delete (older than 2 days)`);
      
      for (const file of freeExpiredFiles as unknown as ExpiredFile[]) {
        try {
          const { error: storageError } = await supabaseClient.storage
            .from('files')
            .remove([file.storage_path]);

          if (storageError) {
            console.warn(`Storage deletion failed for ${file.id}:`, storageError);
          }

          const { error: dbError } = await supabaseClient
            .from('files')
            .delete()
            .eq('id', file.id);

          if (dbError) {
            console.error(`Database deletion failed for ${file.id}:`, dbError);
            errors.push(`DB: ${file.id} - ${dbError.message}`);
            continue;
          }

          await supabaseClient.rpc('update_storage_after_deletion', {
            p_user_id: file.user_id,
            p_file_size: file.file_size
          });

          deletedCount++;
          console.log(`Deleted Free file ${file.id}`);
        } catch (err: any) {
          console.error(`Error processing Free file ${file.id}:`, err);
          errors.push(`Processing: ${file.id} - ${err.message}`);
        }
      }
    }

    // === PREMIUM (PRO) PLAN: Delete files 35 days after premium ends ===
    // Get all expired premium users (subscription_end_date is in the past)
    const { data: expiredProUsers, error: proUsersFetchError } = await supabaseClient
      .from('profiles')
      .select('id, subscription_tier, subscription_end_date')
      .eq('subscription_tier', 'pro')
      .not('subscription_end_date', 'is', null)
      .lt('subscription_end_date', now.toISOString());

    if (proUsersFetchError) {
      console.error('Error fetching expired Pro users:', proUsersFetchError);
      errors.push(`Pro users fetch error: ${proUsersFetchError.message}`);
    } else if (expiredProUsers && expiredProUsers.length > 0) {
      console.log(`Found ${expiredProUsers.length} Pro users with expired subscriptions`);
      
      for (const user of expiredProUsers as ProfileWithFiles[]) {
        if (!user.subscription_end_date) continue;
        
        // Calculate 35 days after subscription ended
        const subscriptionEndDate = new Date(user.subscription_end_date);
        const deletionCutoff = new Date(subscriptionEndDate.getTime() + 35 * 24 * 60 * 60 * 1000);
        
        // Only delete if we're past the 35-day grace period
        if (now < deletionCutoff) {
          console.log(`User ${user.id}: Still within 35-day grace period`);
          continue;
        }
        
        console.log(`User ${user.id}: Past 35-day grace period, deleting files...`);
        
        // Get all files for this user
        const { data: userFiles, error: userFilesError } = await supabaseClient
          .from('files')
          .select('id, storage_path, user_id, file_size')
          .eq('user_id', user.id);

        if (userFilesError) {
          console.error(`Error fetching files for user ${user.id}:`, userFilesError);
          errors.push(`User files fetch: ${user.id} - ${userFilesError.message}`);
          continue;
        }

        if (userFiles && userFiles.length > 0) {
          for (const file of userFiles as ExpiredFile[]) {
            try {
              const { error: storageError } = await supabaseClient.storage
                .from('files')
                .remove([file.storage_path]);

              if (storageError) {
                console.warn(`Storage deletion failed for Pro file ${file.id}:`, storageError);
              }

              const { error: dbError } = await supabaseClient
                .from('files')
                .delete()
                .eq('id', file.id);

              if (dbError) {
                console.error(`Database deletion failed for Pro file ${file.id}:`, dbError);
                errors.push(`DB: ${file.id} - ${dbError.message}`);
                continue;
              }

              await supabaseClient.rpc('update_storage_after_deletion', {
                p_user_id: file.user_id,
                p_file_size: file.file_size
              });

              deletedCount++;
              console.log(`Deleted Pro (expired) file ${file.id}`);
            } catch (err: any) {
              console.error(`Error processing Pro file ${file.id}:`, err);
              errors.push(`Processing: ${file.id} - ${err.message}`);
            }
          }
        }
      }
    }

    // === Clean up orphaned shared_links ===
    const { error: orphanedLinksError } = await supabaseClient
      .from('shared_links')
      .delete()
      .is('file_id', null)
      .is('folder_id', null);

    if (orphanedLinksError) {
      console.warn('Error cleaning orphaned shared links:', orphanedLinksError);
    }

    // === Clean up old download_logs (older than 7 days) ===
    const logsRetentionCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error: logsCleanupError } = await supabaseClient
      .from('download_logs')
      .delete()
      .lt('downloaded_at', logsRetentionCutoff);

    if (logsCleanupError) {
      console.warn('Error cleaning old download logs:', logsCleanupError);
    } else {
      console.log('Cleaned up download logs older than 7 days');
    }

    console.log(`Auto-deletion complete. Deleted ${deletedCount} files total`);

    return new Response(
      JSON.stringify({
        message: 'Auto-deletion completed',
        deleted: deletedCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Fatal error in delete-expired-files:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
