import { PreparationStation } from "@/types/enums";
import { StationDashboardTable } from "../_components/stationDashboardTable";

const StationPage = async ({
  params,
}: {
  params: { station: PreparationStation };
}) => {
  const { station } = await params;

  return (
    <StationDashboardTable
      staffId="123"
      staffName="John Doe"
      station={station.toUpperCase() as PreparationStation}
    />
  );
};

export default StationPage;
