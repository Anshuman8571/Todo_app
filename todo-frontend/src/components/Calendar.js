import React, { useState, useEffect } from 'react';
import './Calendar.css';

function Calendar({ todos, onDateSelect, selectedDate }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);

    useEffect(() => {
        generateCalendarDays();
    }, [currentMonth]); // Removed todos dependency to prevent infinite re-renders

    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = [];
        const current = new Date(startDate);
        
        for (let i = 0; i < 42; i++) {
            const todosForDay = todos.filter(todo => {
                if (!todo.createdAt && !todo.timestamp) return false;
                const todoDate = new Date(todo.createdAt || todo.timestamp);
                
                // Compare year, month, and day separately to avoid timezone issues
                return todoDate.getFullYear() === current.getFullYear() &&
                       todoDate.getMonth() === current.getMonth() &&
                       todoDate.getDate() === current.getDate();
            });
            
            days.push({
                date: new Date(current),
                dateStr: current.toISOString().split('T')[0],
                isCurrentMonth: current.getMonth() === month,
                isToday: current.toDateString() === new Date().toDateString(),
                isSelected: selectedDate && current.toDateString() === selectedDate.toDateString(),
                todoCount: todosForDay.length,
                completedCount: todosForDay.filter(todo => todo.completed).length
            });
            
            current.setDate(current.getDate() + 1);
        }
        
        setCalendarDays(days);
    };

    const navigateMonth = (direction) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + direction);
        setCurrentMonth(newMonth);
    };

    const handleDateClick = (day) => {
        onDateSelect(day.date);
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="calendar">
            <div className="calendar-header">
                <button 
                    className="nav-button" 
                    onClick={() => navigateMonth(-1)}
                    title="Previous month"
                >
                    ‹
                </button>
                <h3 className="month-year">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button 
                    className="nav-button" 
                    onClick={() => navigateMonth(1)}
                    title="Next month"
                >
                    ›
                </button>
            </div>
            
            <div className="calendar-grid">
                {dayNames.map(day => (
                    <div key={day} className="day-header">
                        {day}
                    </div>
                ))}
                
                {calendarDays.map((day, index) => (
                    <div
                        key={index}
                        className={`calendar-day ${
                            !day.isCurrentMonth ? 'other-month' : ''
                        } ${day.isToday ? 'today' : ''} ${
                            day.isSelected ? 'selected' : ''
                        } ${day.todoCount > 0 ? 'has-todos' : ''}`}
                        onClick={() => handleDateClick(day)}
                        title={`${day.date.toDateString()}${
                            day.todoCount > 0 
                                ? ` - ${day.todoCount} todo${day.todoCount > 1 ? 's' : ''}`
                                : ''
                        }`}
                    >
                        <span className="day-number">{day.date.getDate()}</span>
                        {day.todoCount > 0 && (
                            <div className="todo-indicators">
                                <span className="todo-count">{day.todoCount}</span>
                                {day.completedCount > 0 && (
                                    <span className="completed-indicator">✓</span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Calendar;