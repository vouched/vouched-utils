"use strict";

//Global variables
let video = $("#video")[0], //where we will put & test our video output
  deviceList = $("#devices")[0], //device list dropdown
  devices = [], //getSources object to hold various camera options
  streams = [],
  selectedCamera = [], //used to hold a camera's ID and other parameters
  tests, //holder for our test results
  r = 0, //used for iterating through the array
  camNum = 0, //used for iterating through number of camera
  scanning = false; //variable to show if we are in the middle of a scan

async function getDevices() {
  if (!navigator.getUserMedia) {
    return null;
  }
  let devices = await navigator.mediaDevices.enumerateDevices();
  devices = devices.filter(function(deviceInfo) {
    return deviceInfo.kind === "videoinput";
  });
  return devices;
}

function errorCallback(error) {
  console.log("navigator.getUserMedia error: ", error);
}

//Start scan by controlling the quick and full scan buttons
$("button").click(async function() {
  tests = quickScan;

  scanning = true;
  $("button").prop("disabled", true);
  $("table").show();
  $("#jump").show();

  //if there is device enumeration
  let devices = await getDevices();
  if (devices) {
    for (let i = 0; i < devices.length; i++) {
      const resolutions = await toResolutions(tests[r], devices[i]);
      devices[i].resolutions = resolutions;
    }
  }
  console.log(devices);
});

function killStreams() {
  streams.forEach(stream => {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  });
}
async function getMedia(deviceId, resolutions = [], idx = 0) {
  if (idx >= quickScan.length) {
    return resolutions;
  }
  const candidate = quickScan[idx];
  const constraints = {
    video: {
      deviceId,
      width: { exact: candidate.width },
      height: { exact: candidate.height }
    }
  };

  await navigator.mediaDevices
    .getUserMedia(constraints)
    // .then(gotStream)
    .then(() => {
      resolutions.push({
        width: candidate.width,
        height: candidate.height,
        pass: true
      });
    })
    .catch(e => {
      resolutions.push({
        width: candidate.width,
        height: candidate.height,
        pass: false
      });
    });

  return getMedia(deviceId, resolutions, idx + 1);
}

async function toResolutions(candidate, device) {
  const deviceId = device.deviceId ? { exact: device.deviceId } : undefined;
  const resolutions = await getMedia(deviceId);
  killStreams();
  return resolutions;
}

//Variables to use in the quick scan
const quickScan = [
  {
    label: "4K(UHD)",
    width: 3840,
    height: 2160,
    ratio: "16:9"
  },
  {
    label: "1080p(FHD)",
    width: 1920,
    height: 1080,
    ratio: "16:9"
  },
  {
    label: "UXGA",
    width: 1600,
    height: 1200,
    ratio: "4:3"
  },
  {
    label: "720p(HD)",
    width: 1280,
    height: 720,
    ratio: "16:9"
  },
  {
    label: "SVGA",
    width: 800,
    height: 600,
    ratio: "4:3"
  },
  {
    label: "VGA",
    width: 640,
    height: 480,
    ratio: "4:3"
  },
  {
    label: "360p(nHD)",
    width: 640,
    height: 360,
    ratio: "16:9"
  },
  {
    label: "CIF",
    width: 352,
    height: 288,
    ratio: "4:3"
  },
  {
    label: "QVGA",
    width: 320,
    height: 240,
    ratio: "4:3"
  },
  {
    label: "QCIF",
    width: 176,
    height: 144,
    ratio: "4:3"
  },
  {
    label: "QQVGA",
    width: 160,
    height: 120,
    ratio: "4:3"
  }
];
