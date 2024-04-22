/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useDropzone } from "react-dropzone";

const Dropzone = ({ handleSelectedFile }) => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpeg": [".jpeg"],
    },
    multiple: true,
  });
  useEffect(() => {
    if (acceptedFiles) {
      handleSelectedFile(acceptedFiles);
    }
    //eslint-disable-next-line
  }, [acceptedFiles]);

  const files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
    <div>
      <section className="container">
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <p className="click-select-file">
            Drag n drop some files here, or click to select files
          </p>
        </div>
        <aside>
          <h4> Selected Files :</h4>
          <ul>{files}</ul>
        </aside>
      </section>
    </div>
  );
};

export default Dropzone;
