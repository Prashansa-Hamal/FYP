import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import TableForm from "./_components/tableForm";

export default function AddTablePage() {
  return (
    <div className="flex justify-center py-10 px-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Add New Table
          </CardTitle>
          <CardDescription>
            Create a new table for your restaurant floor.
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <TableForm />
        </CardContent>
      </Card>
    </div>
  );
}
