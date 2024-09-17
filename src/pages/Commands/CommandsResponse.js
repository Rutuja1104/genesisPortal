import { Card, CardBody, CardHeader, Col, Container, Row, Label, Input } from "reactstrap";

const CommondResponse = ({ command }) => {
  return (
    <Card className="w-50">
      <CardHeader>
        <h5>{command.label}</h5>
      </CardHeader>
      <CardBody>{command.description}</CardBody>
    </Card>
  );
};

export default CommondResponse;
