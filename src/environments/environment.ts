// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyDXElK5csb0j6gb8nD8Zgb4LVrpLpEWp7E",
    authDomain: "fyp2-iot-parking-db.firebaseapp.com",
    databaseURL: "https://fyp2-iot-parking-db.firebaseio.com",
    projectId: "fyp2-iot-parking-db",
    storageBucket: "fyp2-iot-parking-db.appspot.com",
    messagingSenderId: "828897930642"
  }
};

/*
 * In development mode, for easier debugging, you can ignore zone related error
 * stack frames such as `zone.run`/`zoneDelegate.invokeTask` by importing the
 * below file. Don't forget to comment it out in production mode
 * because it will have a performance impact when errors are thrown
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
