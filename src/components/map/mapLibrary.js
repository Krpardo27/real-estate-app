import * as library from "maplibre-gl";
import workerUrl from "./mapWorker.js?worker&url";

library.setWorkerUrl(workerUrl);
export { library };