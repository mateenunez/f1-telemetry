export interface ProcessedTeamRadio {
    captures: Array<ProcessedCapture>
}

export interface ProcessedCapture {
    utc: string,
    racingNumber: number,
    path: string,
    transcription?: string;
    transcriptionEs?: string;
}

export class TeamRadioProcessor {
    private teamRadio: ProcessedTeamRadio = { captures: [] }

    processTeamRadio(teamRadioData: any): ProcessedTeamRadio {
        if (!teamRadioData || !teamRadioData.Captures) {
            return this.teamRadio;
        }

        let newCaptures;

        if (!Array.isArray(teamRadioData.Captures)) {
            const objectValues: any = Object.values(teamRadioData.Captures);
            const existing = this.teamRadio.captures.find(c => c.utc === objectValues[0].Utc);
            if (existing) {
                if (objectValues[0].Transcription) existing.transcription = objectValues[0].Transcription;
                if (objectValues[0].TranscriptionEs) existing.transcriptionEs = objectValues[0].TranscriptionEs;
                newCaptures = null;
            } else
                newCaptures = [{
                    utc: objectValues[0].Utc,
                    racingNumber: Number(objectValues[0].RacingNumber),
                    path: objectValues[0].Path,
                    transcription: objectValues[0].Transcription,
                    transcriptionEs: objectValues[0].TranscriptionEs,

                }]
        } else {
            newCaptures = teamRadioData.Captures.map((capture: any) => {
                const existing = this.teamRadio.captures.find(c => c.utc === capture.Utc);
                if (existing) {
                    if (capture.Transcription) existing.transcription = capture.Transcription;
                    if (capture.TranscriptionEs) existing.transcriptionEs = capture.TranscriptionEs;
                    return null
                } else
                    return ({
                        utc: capture.Utc,
                        racingNumber: Number(capture.RacingNumber),
                        path: capture.Path,
                        transcription: capture.Transcription,
                        transcriptionEs: capture.TranscriptionEs,
                    })

            });

        }

        if (newCaptures) this.teamRadio.captures.push(...newCaptures);

        return this.teamRadio;
    }

    getTeamRadio(): ProcessedTeamRadio {
        return this.teamRadio;
    }

}

