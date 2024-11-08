const soap = require('strong-soap').soap;
const http = require('http');

const service = {
    BonjourService: {
        BonjourPort: {
            // Méthode Bonjour
            bonjour: function(args) {
                return {
                    message: 'Bonjour !'
                };
            },
            // Méthode Au revoir
            auRevoir: function(args) {
                return {
                    message: 'Au revoir !'
                };
            }
        }
    }
};


const wsdl = `<?xml version="1.0" encoding="UTF-8"?>
<definitions name="BonjourService"
targetNamespace="http://www.examples.com/bonjour"
xmlns:tns="http://www.examples.com/bonjour"
xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/"
xmlns:xsd="http://www.w3.org/2001/XMLSchema"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

<message name="bonjourRequest">
<part name="name" type="xsd:string"/>
</message>

<message name="bonjourResponse">
<part name="message" type="xsd:string"/>
</message>

<message name="auRevoirRequest">
<part name="name" type="xsd:string"/>
</message>

<message name="auRevoirResponse">
<part name="message" type="xsd:string"/>
</message>

<portType name="BonjourPortType">
<operation name="bonjour">
<input message="tns:bonjourRequest"/>
<output message="tns:bonjourResponse"/>
</operation>
<operation name="auRevoir">
<input message="tns:auRevoirRequest"/>
<output message="tns:auRevoirResponse"/>
</operation>
</portType>

<binding name="BonjourBinding" type="tns:BonjourPortType">
<soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
<operation name="bonjour">
<soap:operation soapAction="urn:bonjour"/>
<input>
<soap:body use="encoded" namespace="http://www.examples.com/bonjour" encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"/>
</input>
<output>
<soap:body use="encoded" namespace="http://www.examples.com/bonjour" encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"/>
</output>
</operation>
<operation name="auRevoir">
<soap:operation soapAction="urn:auRevoir"/>
<input>
<soap:body use="encoded" namespace="http://www.examples.com/bonjour" encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"/>
</input>
<output>
<soap:body use="encoded" namespace="http://www.examples.com/bonjour" encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"/>
</output>
</operation>
</binding>

<service name="BonjourService">
<port name="BonjourPort" binding="tns:BonjourBinding">
<soap:address location="http://localhost:8000/soap"/>
</port>
</service>
</definitions>`;

const server = http.createServer(function(request, response) {
    response.end("404: Not Found: " + request.url);
});


soap.listen(server, '/soap', service, wsdl);


server.listen(8000, function() {
    console.log('Le serveur SOAP est en écoute sur http://localhost:8000/soap');
});
