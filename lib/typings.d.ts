interface GeoCoordinates {
    lat: number;
    long: number;
}

interface Config {
    changeBy: 'sunlight' | 'time';
    wallpapers: {
        "dawn": string;
        "sunrise": string;
        "noon": string;
        "sunset": string;
        "dusk": string;
        "night": string;
        [time: string]: string;
    };
    location?: string | GeoCoordinates;
    wallpapersDir?: string;
}

interface State {
    location?: GeoCoordinates;
}

interface GeoIpLocation {
    ip: string;
    hostname: string;
    city: string;
    region: string;
    country: string;
    loc: string;
    org: string;
    postal: string;
    timezone: string;
}

interface ConfigManager {
    read(): Promise<Config | null>;
    write(config: Config): Promise<void>;
}

interface StateManager {
    read(): Promise<State | null>;
    write(state: State): Promise<void>;
}

type WallpaperChanger = (string) => Promise<void>;
type PartsOfDay = 'sunrise' | 'noon' | 'sunset' | 'dusk' | 'night' | 'dawn';
type IntervalType = '()' | '[)' | '(]' | '[]';