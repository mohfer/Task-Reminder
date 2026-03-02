export const EmptyState = ({ message = 'No data found', colSpan = 1 }) => {
    return (
        <tr>
            <td colSpan={colSpan} className="px-8 py-4 text-center text-muted-foreground">
                {message}
            </td>
        </tr>
    );
};
