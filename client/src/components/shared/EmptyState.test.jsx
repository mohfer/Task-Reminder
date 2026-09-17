import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CalendarX } from 'lucide-react';
import { EmptyState } from './EmptyState';

const renderEmptyState = (props) =>
    render(
        <MemoryRouter>
            <EmptyState
                icon={CalendarX}
                title="No courses yet"
                description="Add your first course to get started."
                {...props}
            />
        </MemoryRouter>
    );

describe('EmptyState', () => {
    it('renders title and description without action', () => {
        renderEmptyState();
        expect(screen.getByText('No courses yet')).toBeInTheDocument();
        expect(screen.getByText('Add your first course to get started.')).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('renders a link action when actionTo is provided', () => {
        renderEmptyState({ actionLabel: 'Add Courses', actionTo: '/course-contents' });
        const link = screen.getByRole('link', { name: 'Add Courses' });
        expect(link).toHaveAttribute('href', '/course-contents');
    });

    it('renders a button action that calls onAction', () => {
        const onAction = vi.fn();
        renderEmptyState({ actionLabel: 'Add Course', onAction });
        const button = screen.getByRole('button', { name: 'Add Course' });
        fireEvent.click(button);
        expect(onAction).toHaveBeenCalledOnce();
    });
});
