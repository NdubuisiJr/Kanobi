type CardProps = {
  title: string;
  value: string;
  valueClassName?: string;
};

export default function InfoCard({ title, value, valueClassName }: CardProps) {
  return (
    <div className="max-w-xs p-4 bg-gray-900 rounded shadow border mx-4 flex flex-col">
      <h4 className="text-sm font-semibold text-gray-600">{title}</h4>
      <p
        className={`mt-2 text-lg font-medium ${
          valueClassName || "text-gray-400"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
