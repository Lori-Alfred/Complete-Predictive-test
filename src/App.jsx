import { useEffect, useState } from "react";
import "./App.css";
import { postData, putDataPresignedUrl } from "./apis/apiMethods";
import Dropzone from "./components/Dropzone/Dropzone";
import { apiEndpoints } from "./apis/apiEndpoints";
import { convertToBase64 } from "./components/helpers/convertToBase64";
import WelcomePage from "./components/WelcomePage/WelcomePage";

function App() {
  const [Isloading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [generatedResultsArray, setGeneratedResultsArray] = useState(null);
  const [stagingResultsArray, setStagingResultsArray] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [showWelcomePage, setShowWelcomePage] = useState(true);
  const handleSelectedFile = (data) => {
    setSelectedFiles(data);
  };
  useEffect(() => {
    setTimeout(() => {
      setShowWelcomePage(false);
    }, 2000);
  }, []);
  useEffect(() => {
    if (generatedResultsArray && generatedResultsArray.length > 0) {
      stagingFilesOnS3();
    }
    //eslint-disable-next-line
  }, [generatedResultsArray]);

  // Generate presignedurl for each selected files concurrently
  const generateUrl = async () => {
    try {
      setIsLoading(true);
      const generatedUrlPromises = selectedFiles?.map(async (selectedFile) => {
        try {
          const Response = await postData(apiEndpoints.assetsStage, "");
          const { url, key } = Response;
          return { selectedFile, url, key };
        } catch (error) {
          setError("Error generating URL");
          setTimeout(() => {
            setError(null);
          }, 5000);
        }
      });
      // Return all presigned url,key for each selected file
      const generatedResults = await Promise.all(generatedUrlPromises);
      setGeneratedResultsArray(generatedResults);
      setIsLoading(false);
    } catch (error) {
      setError("Error generating URL");
      setIsLoading(false);
    }
  };

  // stage file via aws s3 via Put Method
  const stagingFilesOnS3 = async () => {
    try {
      setIsLoading(true);

      // map generated urls to stage to s3 bucket
      const stagingFiles = generatedResultsArray?.map(
        async ({ key, selectedFile, url }) => {
          try {
            const binaryData = await convertToBase64(selectedFile);

            const uploadResponse = await putDataPresignedUrl(url, binaryData, {
              Accept: "*/*",
              "Content-Type": "image/jpeg",
            });
            // when upload response is successful for run post API method for asset process
            if (uploadResponse.ok) {
              const reqBody = `key=${key}&pipeline=dragonfly-img-basic`;
              const processingResponse = await postData(
                apiEndpoints.assetsProcess,
                reqBody,
                { "Content-Type": "application/x-www-form-urlencoded" }
              );
              // when processing response is successful for run post API method for asset status

              if (processingResponse) {
                const statusReqBody = {
                  taskId: processingResponse?.taskId,
                };
                const checkStatus = await postData(
                  apiEndpoints.assetsStatus,
                  statusReqBody,
                  {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store",
                  }
                );
                return checkStatus;
              }
            }
          } catch (error) {
            setError("Error staging files on amazon S3");
            setTimeout(() => {
              setError(null);
            }, 5000);
          }
        }
      );
      const stagingFilesResults = await Promise.all(stagingFiles);
      setStagingResultsArray(stagingFilesResults);
      setIsLoading(false);
    } catch (error) {
      setError("Error staging files on amazon S3");
      setIsLoading(false);
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      {showWelcomePage ? (
        <WelcomePage />
      ) : (
        <>
          {stagingResultsArray &&
            stagingResultsArray.length > 0 &&
            stagingResultsArray.map((stagingResult) => {
              <div className="success-message">{stagingResult}</div>;
            })}
          {Isloading && <div>{`loading....`}</div>}
          {error && <div className="error-message">{error}</div>}{" "}
          <div className="dropzone-container">
            <button onClick={generateUrl} disabled={Isloading}>
              Send selected files
            </button>
            <div>
              <Dropzone handleSelectedFile={handleSelectedFile} />
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default App;
