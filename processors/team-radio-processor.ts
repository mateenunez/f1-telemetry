export interface ProcessedTeamRadio {
    captures: Array<ProcessedCapture>
}

export interface ProcessedCapture {
    utc: string,
    racingNumber: number,
    path: string
}

export class TeamRadioProcessor {
    private teamRadio: ProcessedTeamRadio = { captures: [] }

    processTeamRadio(teamRadioData: any): ProcessedTeamRadio {
        if (!teamRadioData || !teamRadioData.Captures) {
            this.teamRadio.captures = [];
            return this.teamRadio;
        }

        let newCaptures;

        if (!Array.isArray(teamRadioData.Captures)) {
            const objectValues: any = Object.values(teamRadioData.Captures);
            newCaptures = [{
                utc: objectValues[0].Utc,
                racingNumber: Number(objectValues[0].RacingNumber),
                path: objectValues[0].Path
            }]
        } else {
            newCaptures = teamRadioData.Captures.map((capture: any) => ({
                utc: capture.Utc,
                racingNumber: Number(capture.RacingNumber),
                path: capture.Path
            }));
        }



        this.teamRadio.captures.push(...newCaptures);

        return this.teamRadio;
    }

    getTeamRadio(): ProcessedTeamRadio {
        return this.teamRadio;
    }

}

