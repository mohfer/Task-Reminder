import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WeeklyScheduleHeader = ({ weekLabel, onPrev, onNext, prevLabel, nextLabel }) => {
    return (
        <div className="mb-4 flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={onPrev} aria-label={prevLabel}>
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <h3 className="text-sm font-semibold text-foreground sm:text-base">{weekLabel}</h3>

            <Button variant="outline" size="icon" onClick={onNext} aria-label={nextLabel}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
};
