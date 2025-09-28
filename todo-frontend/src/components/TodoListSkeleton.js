// Create this as a new component, e.g., TodoListSkeleton.js

export const TodoListSkeleton = () => (
    <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                </div>
            </div>
        ))}
    </div>
);
