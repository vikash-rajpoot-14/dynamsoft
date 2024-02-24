let autoFeeder = document.getElementById("autoFeeder").checked;

function toggleFeeder(id) {
  let checkbox = document.getElementById(id);
  autoFeeder = checkbox.checked;
}

let ShowUi = document.getElementById("showUI").checked;

function toggleShowui(id) {
  let checkbox = document.getElementById(id);
  ShowUi = checkbox.checked;
}

let DWObject;

Dynamsoft.DWT.RegisterEvent("OnWebTwainReady", Dynamsoft_OnReady);

function Dynamsoft_OnReady() {
  DWObject = Dynamsoft.DWT.GetWebTwain("dwtcontrolContainer");

  const thumbnailViewer = DWObject.Viewer.createThumbnailViewer({
    size: "100%",
    rows: 2,
    columns: 2,
  });
  thumbnailViewer.show();
  populateSources();
}

function populateSources() {
  let sourceDropdown = document.getElementById("source");
  sourceDropdown.innerHTML = "";

  DWObject.IfShowUI = ShowUi;
  DWObject.OpenSourceManager();
  let sourceCount = DWObject.SourceCount;
  for (let i = 0; i < sourceCount; i++) {
    let sourceName = DWObject.GetSourceNameItems(i);
    let option = document.createElement("option");
    option.value = i;
    option.text = sourceName;
    sourceDropdown.add(option);
  }
  DWObject.CloseSourceManager();
}

let selectedValueResolution = document.getElementById("resolution").value;
function updateResolution() {
  const resolutionSelect = document.getElementById("resolution");
  selectedValueResolution = resolutionSelect.value;
}

const radioButtons = document.getElementsByName("pixelType");
let selectedPixelValue = document.querySelector(
  'input[name="pixelType"]:checked'
).value;
radioButtons.forEach(function (radioButton) {
  radioButton.addEventListener("change", function () {
    const selectedValue = document.querySelector(
      'input[name="pixelType"]:checked'
    ).value;
    selectedPixelValue = selectedValue;
  });
});

function ImagesAquire() {
  return DWObject.AcquireImageAsync({
    IfCloseSourceAfterAcquire: true,
    IfShowUI: ShowUi,
    PixelType: Dynamsoft.DWT.EnumDWT_PixelType[`TWPT_${selectedPixelValue}`],
    Resolution: parseInt(selectedValueResolution),
    IfFeederEnabled: autoFeeder,
    SelectSourceByIndex: document.getElementById("source").value,
  })
    .then(function (result) {
      if (DWObject.HowManyImagesInBuffer > 0) {
        return;
      } else {
        console.warn("No image to scan.");
      }
    })
    .catch(function (e) {
      console.error("error during in image acquiring: " + e.message);
    })
    .finally(function () {
      DWObject.CloseSourceAsync().catch(function (e) {
        console.error(e);
      });
    });
}

function Scan() {
  if (!DWObject) {
    console.error("DWObject is not initialized.");
    return;
  }

  if (ShowUi) {
    DWObject.OpenSource();
    ImagesAquire();
  } else {
    ImagesAquire();
  }
}

async function scanandSave1() {
  if (!DWObject) {
    console.error("DWObject is not initialized.");
    return;
  }

  if (ShowUi) {
    DWObject.OpenSource();
  }

  DWObject.AcquireImageAsync({
    IfCloseSourceAfterAcquire: true,
    IfShowUI: ShowUi,
    PixelType: Dynamsoft.DWT.EnumDWT_PixelType[`TWPT_${selectedPixelValue}`],
    Resolution: parseInt(selectedValueResolution),
    IfFeederEnabled: autoFeeder,
    SelectSourceByIndex: document.getElementById("source").value,
  })
    .then(function (result) {
      // console.log("image acquired :", result);
        DWObject.IfShowFileDialog = true;
        DWObject.SaveAllAsPDF(
          "C:temp\\images.pdf",
          function () {
            console.log("multipage pdf saved successfully");
          },
          function (errCode, errString) {
            console.error("error in multipage pdf:", errString);
          }
        );
      if (DWObject.HowManyImagesInBuffer > 0) {
      } else {
        console.warn("No image to scan.");
      }
    })
    .catch(function (e) {
      console.error("error during in image acquiring: " + e.message);
    })
    .finally(function () {
      DWObject.CloseSourceAsync().catch(function (e) {
        console.error(e);
      });
    });
}

function scanandSave2() {
  if (!DWObject) {
    console.error("DWObject is not initialized.");
    return;
  }

  if (ShowUi) {
    DWObject.OpenSource();
  }

  DWObject.AcquireImageAsync({
    IfCloseSourceAfterAcquire: true,
    IfShowUI: ShowUi,
    PixelType: Dynamsoft.DWT.EnumDWT_PixelType[`TWPT_${selectedPixelValue}`],
    Resolution: parseInt(selectedValueResolution),
    IfFeederEnabled: autoFeeder,
    SelectSourceByIndex: document.getElementById("source").value,
  })
    .then(function (result) {
      // console.log("image acquired :", result);
    DWObject.IfShowFileDialog = false;
    if (DWObject.HowManyImagesInBuffer > 0) {
      for (let i = 0; i < DWObject.HowManyImagesInBuffer; i++) {
        let pdfFilePath = `C:\\temp\\image_${i + 1}.pdf`;
        (function (imageIndex) {
          DWObject.SaveAsPDF(
            pdfFilePath,
            imageIndex,
            function () {
              console.log("File save in localdrive C :", pdfFilePath);
            },
            function (code, string) {
              console.error(code, string);
            }
          );
        })(i);
      }
      console.log("Done");
    } else {
      console.log("no image to scan");
    }
})
.catch(function (e) {
  console.error("error during in image acquiring: " + e.message);
})
.finally(function () {
  DWObject.CloseSourceAsync().catch(function (e) {
    console.error(e);
  });
});
}

function removeImage() {
  if (DWObject) {
    if (DWObject.IsBlankImageExpress(DWObject.CurrentImageIndexInBuffer)) {
      DWObject.RemoveImage(DWObject.CurrentImageIndexInBuffer);
    } else {
      alert("no blank page");
    }
  }
}

function removeImages() {
  if (DWObject) {
    DWObject.RemoveAllImages();
  }
}
