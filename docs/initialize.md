# iniciar um novo projeto/cliente

## Cadastro de Nova Company no MongoDB

Ao iniciar um novo projeto/cliente é necessário criar um registro específico na collection companies no banco de dados configurado no .env (ex: base-api-ts-tenants). É por meio desse registro que será criado um banco de dados único para o cliente em questão.

Neste guia, vamos detalhar o processo de cadastramento de uma nova company na sua instância do MongoDB para um novo projeto ou cliente. Uma company é uma entidade que representa uma organização ou cliente. 

### Pré-requisitos

- Acesso à sua instância do MongoDB.
- As informações necessárias da nova company, como nome, chave, e informações de autenticação.

### Passo a Passo

1. **Conecte-se ao MongoDB**

   Certifique-se de que você está conectado à sua instância do MongoDB. Você pode usar um cliente MongoDB ou uma biblioteca de programação, dependendo do seu ambiente.

2. **Acesse a Collection "companies"**

   No MongoDB, as informações da company serão armazenadas em um banco de dados que é definido no .env como MONGO_DB_NAME_TENANTS e em uma coleção chamada "companies". Certifique-se de que você está trabalhando nessa coleção.

3. **Crie um Novo Documento da Company**

   Para cadastrar a nova company, você deve criar um novo documento JSON na coleção "companies". O documento deve seguir a estrutura adequada, incluindo campos como "name", "key", "tenantID", "active", "deleted" e "credentials".

   ```json
   {
     "name": "Nome do Cliente",
     "key": "Chave da Nova Company",
     "tenantID": "Nome do BD do Cliente",
     "active": true,  // Define se a company está ativa ou suspensa
     "deleted": false, // Define se a company foi excluída
     "credentials": {
       // Informações de autenticação da company
     }
   }

4. **Preencha as Informações de Autenticação**

Dentro do campo "credentials", preencha todas as informações de autenticação necessárias para a nova company. Isso pode inclui campos como:
- smtp_user: Email que será utilizado para enviar emails
- smtp_pass: Senha do email que será utilizado para o envio de emails

5. **Salve o Documento**

Após preencher todas as informações necessárias, salve o documento na coleção "companies". O MongoDB atribuirá automaticamente um _id único ao documento.

6. **Verifique o Cadastro**

Para verificar se a nova company foi cadastrada com sucesso, você pode executar consultas na coleção "companies" ou utilizar ferramentas de gerenciamento do MongoDB.

**Concluído!**

Agora você tem uma nova company registrada na sua instância do MongoDB, pronta para ser utilizada no seu projeto.

Lembre-se de manter as informações de autenticação, especialmente a chave privada, em um local seguro e gerenciado de forma apropriada para garantir a segurança da sua aplicação e dos dados do cliente.

**Concluído!**