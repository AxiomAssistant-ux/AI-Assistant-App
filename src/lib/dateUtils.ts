import { ActionItem } from './types';

/**
 * Calculates the due date for an action item, with fallback to parsing "Timeline: X" from description.
 * @param item The ActionItem to calculate due date for
 * @returns Date object or null if no valid date found
 */
export const getActionItemDueDate = (item: ActionItem): Date | null => {
    // Check if backend provided a valid due_at date
    if (item.due_at) {
        const dueDate = new Date(item.due_at);
        // Ignore 1/1/1970 or invalid dates
        if (!isNaN(dueDate.getTime()) && dueDate.getFullYear() > 1970) {
            return dueDate;
        }
    }

    // Fallback: Parse "Timeline: X" from description
    const timelineMatch = item.description.match(/Timeline:\s*(\d+)/i);
    if (timelineMatch && timelineMatch[1]) {
        const hours = parseInt(timelineMatch[1], 10);
        const createdDate = new Date(item.created_at);
        if (!isNaN(createdDate.getTime())) {
            return new Date(createdDate.getTime() + hours * 60 * 60 * 1000);
        }
    }

    return null;
};

/**
 * Formats the due date display string
 * @param date Date object
 * @returns Formatted string or 'Not set'
 */
export const formatDueDateDisplay = (date: Date | null): string => {
    if (!date) return 'Not set';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Checks if an action item is overdue
 * @param item The ActionItem to check
 * @returns boolean
 */
export const isActionItemOverdue = (item: ActionItem): boolean => {
    if (item.status === 'completed') return false;
    const dueDate = getActionItemDueDate(item);
    if (!dueDate) return false;
    return dueDate < new Date();
};
