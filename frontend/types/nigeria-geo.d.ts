declare module 'nigeria-geo' {
  export interface LGA {
    name: string;
  }
  export interface State {
    state: string;
    lgas: string[];
  }
  const Location: {
    states: () => string[];
    all: () => State[];
  };
  export default Location;
}
