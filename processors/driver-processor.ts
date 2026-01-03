export interface ProcessedDriver {
  driver_number: number;
  name_acronym: string;
  full_name: string;
  team_name: string;
  team_colour: string;
  broadcast_name: string;
  first_name: string;
  last_name: string;
  headshot_url: string;
  grid_position?: number;
}

export class DriverProcessor {
  private drivers: Map<number, ProcessedDriver> = new Map();

  processDriverList(driverList: any): ProcessedDriver[] {
    if (!driverList || typeof driverList !== "object") {
      return [];
    }

    const processedDrivers: ProcessedDriver[] = [];

    Object.entries(driverList).forEach(
      ([driverNumber, data]: [string, any]) => {
        if (driverNumber === "_kf" || !data || typeof data !== "object") return;

        const driverNum = Number.parseInt(driverNumber);
        if (isNaN(driverNum)) return;

        const existing = this.drivers.get(driverNum);

        const processed: ProcessedDriver = {
          driver_number: driverNum,
          name_acronym: data.Tla || existing?.name_acronym || "",
          full_name: data.FullName || existing?.full_name || "",
          team_name: data.TeamName || existing?.team_name || "",
          team_colour: data.TeamColour || existing?.team_colour || "",
          broadcast_name: data.BroadcastName || existing?.broadcast_name || "",
          first_name: data.FirstName || existing?.first_name || "",
          last_name: data.LastName || existing?.last_name || "",
          headshot_url: data.HeadshotUrl || existing?.headshot_url || "",
          grid_position: existing?.grid_position,
        };

        this.drivers.set(processed.driver_number, processed);
        processedDrivers.push(processed);
      }
    );

    return processedDrivers;
  }

  processGridPositions(timingAppData: any): void {
    if (!timingAppData || !timingAppData.Lines) {
      return;
    }

    Object.entries(timingAppData.Lines).forEach(
      ([driverNumber, Line]: [string, any]) => {
        const driverNum = Number.parseInt(driverNumber);
        if (isNaN(driverNum)) return;
        const existing = this.drivers.get(driverNum);
        if (existing) {
          existing.grid_position =
            Number.parseInt(Line.GridPos) || existing.grid_position;
          this.drivers.set(driverNum, existing);
        } else {
          const processed: ProcessedDriver = {
            driver_number: driverNum,
            name_acronym: "",
            full_name: "",
            team_name: "",
            team_colour: "",
            broadcast_name: "",
            first_name: "",
            last_name: "",
            headshot_url: "",
            grid_position: Number.parseInt(Line.GridPos) || undefined,
          };
          this.drivers.set(driverNum, processed);
        }
      }
    );
  }

  getDriver(driverNumber: number): ProcessedDriver | undefined {
    return this.drivers.get(driverNumber);
  }

  getAllDrivers(): ProcessedDriver[] {
    return Array.from(this.drivers.values());
  }
}
