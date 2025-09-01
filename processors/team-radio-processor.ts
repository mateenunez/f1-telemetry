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
        if (!teamRadioData || !teamRadioData.Captures || !Array.isArray(teamRadioData.Captures)) {
            this.teamRadio.captures = [];
            return this.teamRadio;
        }

        const lastCapture = teamRadioData.Captures[teamRadioData.Captures.length - 1];
        if (lastCapture) {
            this.teamRadio.captures = [{
                utc: lastCapture.Utc,
                path: lastCapture.Path,
                racingNumber:Number(lastCapture.RacingNumber)
            }];
        } else {
            this.teamRadio.captures = [];
        }

        return this.teamRadio;
    }

    getTeamRadio(): ProcessedTeamRadio {
        return this.teamRadio;
    }

}

