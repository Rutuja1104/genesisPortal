import { MDBBtn } from "mdb-react-ui-kit";
import { useState } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";

export default function Commands({ commands }) {
  console.log("commands", commands);
  // const [commands, setCommands] = useState([
  //   {
  //     scope: "organization",
  //     label: "command 1",
  //     key: "command_1",
  //     description: "enter the value",
  //     params: [
  //       {
  //         label: "param1",
  //         type: "text",
  //       },
  //       {
  //         label: "param2",
  //         type: "number",
  //       },
  //     ],
  //   },
  //   {
  //     scope: "organization",
  //     label: "command 2",
  //     key: "command_2",
  //     description: "enter the value 4",
  //     params: [],
  //   },
  //   {
  //       scope: "organization",
  //       label: "command 2",
  //       key: "command_2",
  //       description: "enter the value 4",
  //       params: [],
  //     },
  // ]);
  return (
    <Container fluid>
      <Row>
        {commands
          ?.filter((element) => element.scope === "organization")
          .map((e) => (
            <Col xs="12" sm="6" md="6" lg="6" key={e.key}>
              <Card className="my-2">
                <CardHeader className="d-flex justify-content-between">
                  <MDBBtn>{e.label}</MDBBtn>
                  <span>{`(${e.description})`}</span>
                </CardHeader>
                <CardBody>
                  <b>Response : </b>
                </CardBody>
              </Card>
            </Col>
          ))}
      </Row>
    </Container>
  );
}
