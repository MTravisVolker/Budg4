export default function FieldHint({ message, testId }: { message?: string; testId?: string }) {
  if (!message) return null;
  return (
    <span className="text-error text-sm mt-1" data-testid={testId}>
      {message}
    </span>
  );
}
