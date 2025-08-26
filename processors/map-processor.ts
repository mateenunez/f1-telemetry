export interface iMap {
	corners: Corner[];
	marshalLights: Corner[];
	marshalSectors: Corner[];
	candidateLap: CandidateLap;
	circuitKey: number;
	circuitName: string;
	countryIocCode: string;
	countryKey: number;
	countryName: string;
	location: string;
	meetingKey: string;
	meetingName: string;
	meetingOfficialName: string;
	raceDate: string;
	rotation: number;
	round: number;
	trackPositionTime: number[];
	x: number[];
	y: number[];
	year: number;
};

export interface CandidateLap {
	driverNumber: string;
	lapNumber: number;
	lapStartDate: string;
	lapStartSessionTime: number;
	lapTime: number;
	session: string;
	sessionStartTime: number;
};

export interface Corner {
	angle: number;
	length: number;
	number: number;
	letter?:string;
	trackPosition: TrackPosition;
};

export interface TrackPosition {
	x: number;
	y: number;
};

export interface MapSector {
	number: number;
	start: TrackPosition;
	end: TrackPosition;
	points: TrackPosition[];
};


export const fetchMap = async (circuitKey: number): Promise<iMap | null> => {
	try {
		const year = new Date().getFullYear();

		const mapRequest = await fetch(`https://api.multiviewer.app/api/v1/circuits/${circuitKey}/${year}`, {
			next: { revalidate: 60 * 60 * 2 },
		});

		if (!mapRequest.ok) {
			console.error("Failed to fetch map", mapRequest);
			return null;
		}

		return mapRequest.json();
	} catch (error) {
		console.error("Failed to fetch map", error);
		return null;
	}
};

export const rad = (deg: number) => deg * (Math.PI / 180);

export const rotate = (x: number, y: number, a: number, px: number, py: number) => {
	const c = Math.cos(rad(a));
	const s = Math.sin(rad(a));

	x -= px;
	y -= py;

	const newX = x * c - y * s;
	const newY = y * c + x * s;

	return { y: newX + px, x: newY + py };
};

const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

const findMinDistance = (point: TrackPosition, points: TrackPosition[]) => {
	let min = Infinity;
	let minIndex = -1;
	for (let i = 0; i < points.length; i++) {
		const distance = calculateDistance(point.x, point.y, points[i].x, points[i].y);
		if (distance < min) {
			min = distance;
			minIndex = i;
		}
	}
	return minIndex;
};

export const createSectors = (map: iMap): MapSector[] => {
	const sectors: MapSector[] = [];
	const points: TrackPosition[] = map.x.map((x, index) => ({ x, y: map.y[index] }));

	for (let i = 0; i < map.marshalSectors.length; i++) {
		sectors.push({
			number: i + 1,
			start: map.marshalSectors[i].trackPosition,
			end: map.marshalSectors[i + 1] ? map.marshalSectors[i + 1].trackPosition : map.marshalSectors[0].trackPosition,
			points: [],
		});
	}

	const dividers: number[] = sectors.map((s) => findMinDistance(s.start, points));
	for (let i = 0; i < dividers.length; i++) {
		const start = dividers[i];
		const end = dividers[i + 1] ? dividers[i + 1] : dividers[0];
		if (start < end) {
			sectors[i].points = points.slice(start, end + 1);
		} else {
			sectors[i].points = points.slice(start).concat(points.slice(0, end + 1));
		}
	}

	return sectors;
};


