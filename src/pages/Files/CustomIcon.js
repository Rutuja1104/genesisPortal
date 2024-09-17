import { MDBIcon } from "mdb-react-ui-kit";

export default function CustomeIcon({ type }) {
  return (
    <>
      <MDBIcon fas icon={type} color={type === "folder" ? "primary" : "info"} />
    </>
  );
}
