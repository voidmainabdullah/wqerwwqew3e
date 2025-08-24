import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  MessageCircle,
  Paperclip
} from 'lucide-react';

const TaskBoard = () => {
  const tasks = [
    {
      id: 1,
      title: "Design System Updates",
      description: "Update color palette and typography",
      status: "in-progress",
      priority: "high",
      assignee: "Sarah",
      dueDate: "Today",
      comments: 3,
      attachments: 2
    },
    {
      id: 2,
      title: "User Authentication",
      description: "Implement OAuth and 2FA",
      status: "completed",
      priority: "medium",
      assignee: "Mike",
      dueDate: "Yesterday",
      comments: 1,
      attachments: 0
    },
    {
      id: 3,
      title: "Database Migration",
      description: "Migrate to new database schema",
      status: "todo",
      priority: "low",
      assignee: "Alex",
      dueDate: "Tomorrow",
      comments: 0,
      attachments: 1
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in-progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Live Project Board</h3>
        <p className="text-sm text-muted-foreground">Real-time collaboration in action</p>
      </div>
      
      {tasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50 hover:border-l-primary">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <h4 className="font-medium text-foreground text-sm">{task.title}</h4>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground">{task.description}</p>

                {/* Status and Meta */}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(task.status)}`}
                  >
                    {task.status.replace('-', ' ')}
                  </Badge>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{task.dueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    {task.comments > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageCircle className="h-3 w-3" />
                        <span>{task.comments}</span>
                      </div>
                    )}
                    {task.attachments > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Paperclip className="h-3 w-3" />
                        <span>{task.attachments}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {task.assignee.charAt(0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default TaskBoard;