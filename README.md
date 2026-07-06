# OrderHub — Sistema de Gestão de Ordens de Venda (OVGS)

Sistema para gestão do ciclo de vida de Ordens de Venda (OVs), incluindo cadastro de clientes,
tipos de transporte, itens, criação e acompanhamento de ordens, agendamento de entregas e auditoria.

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Vite 8 |
| Estilização | Tailwind CSS v4 (tema escuro) |
| Backend | ASP.NET Core Web API (.NET 10) |
| ORM | Entity Framework Core 10 (SQLite) |
| Auth | JWT (Bearer token) + BCrypt |
| Testes | xUnit + Moq + EF Core InMemory |
| OpenAPI | Swagger via Microsoft.AspNetCore.OpenApi |
| Container | Docker |

## Como Rodar

### Docker

```bash
docker build -t orderhub .
docker run -p 5000:5000 orderhub
```

Acessar em `http://localhost:5000`

Documentação da API disponível em `/scalar/v1`.

### Desenvolvimento

**Backend:**

```bash
cd backend
dotnet restore
dotnet run
# Inicia em http://localhost:5000
```

**Frontend (desenvolvimento com hot-reload):**

```bash
cd frontend
npm install
npm run dev
# Inicia em http://localhost:3000 (proxy /api → localhost:5000)
```

### Credenciais

| Usuário | Senha |
|---------|-------|
| `admin` | `admin123` |

### Testes

```bash
dotnet test backend/Tests/order-hub.Tests.csproj
```

## Funcionalidades

- **Autenticação** — JWT com login e proteção de rotas
- **Clientes** — CRUD com cadastro de tipos de transporte autorizados
- **Itens** — CRUD de produtos com SKU, preço e estoque
- **Tipos de Transporte** — CRUD de modalidades (Caminhão, Avião, Navio, Van)
- **Ordens de Venda** — Ciclo completo: CRIADA → PLANEJADA → AGENDADA → EM_TRANSPORTE → ENTREGUE
- **Agendamento** — Definição de data e janela de atendimento
- **Monitoramento** — Dashboard com filtros por status, cliente, transporte e data
- **Auditoria** — Registro de todas as alterações com estado anterior/posterior

## Regras de Negócio

### Autorização de Transporte

Cada cliente possui uma lista de tipos de transporte autorizados. Uma Ordem de Venda
somente pode ser criada se o tipo de transporte informado estiver autorizado para o cliente.

### Fluxo de Status

```
CRIADA → PLANEJADA → AGENDADA → EM_TRANSPORTE → ENTREGUE
```

- **CRIADA**: Ordem criada com itens e tipo de transporte
- **PLANEJADA**: Ordem revisada e pronta para agendamento
- **AGENDADA**: Data e janela de atendimento definidas
- **EM_TRANSPORTE**: Carga em trânsito
- **ENTREGUE**: Entrega concluída

Transições inválidas são rejeitadas. Cancelamento permitido apenas nos status CRIADA e PLANEJADA.

### Itens

Os itens são previamente cadastrados e vinculados às ordens no momento da criação.
Cada ordem deve conter ao menos um item para ser planejada.

## Decisões Arquiteturais

### Arquitetura em Camadas

```
Controller → Service (Interface + Implementação) → DbContext → SQLite
```

Separação clara entre:
- **Controllers**: Handlers HTTP com validação de entrada via DTOs
- **Services**: Regras de negócio e orquestração
- **Repositories**: EF Core DbContext como unidade de trabalho

### DTOs (Data Transfer Objects)

- **Request DTOs**: Desacoplam o contrato da API do modelo de domínio, prevenindo over-posting
- **Response DTOs**: Controlam a serialização e evitam exposição de dados internos

### Padrões Utilizados

- **Interface Segregation**: Services expostos via interfaces para testabilidade
- **Dependency Injection**: Resolução de dependências via container do ASP.NET Core
- **Unit of Work**: DbContext compartilhado entre serviços
- **Audit Trail**: Serviço dedicado para registro de auditoria transversal

## Estratégia de Modelagem de Domínio

```
Customer ───< CustomerTransportType >─── TransportType
    │                                            │
    │                                            │
    └──< Order ───>───< OrderItem >─── Item
              │
              └── DeliverySchedule
```

- **CustomerTransportType**: Join table many-to-many para autorização de transportes por cliente
- **Order**: Agregado principal com status, transporte, itens e agendamento
- **DeliverySchedule**: Objeto de valor vinculado à Order com data e janela de atendimento
- **OrderItem**: Item de linha com preço congelado no momento da criação

## Estratégia de Persistência

- **SQLite** via EF Core com migrations automáticas no startup
- **Cascade delete**: Order → OrderItems, Order → DeliverySchedule
- **Restrict delete**: Customer → Orders, Item → OrderItems, TransportType → Orders
- Seed data automatizado com cliente admin, 5 clientes, 8 itens, 4 transportes, pedidos de exemplo

## Auditoria

Eventos registrados via `AuditService` com:
- Data/hora e tipo de ação
- Entidade afetada
- Estado anterior e posterior (JSON)
- Usuário responsável (quando disponível)

Eventos mínimos: Criação de OV, alteração de status, alteração de agendamento, alteração de transporte.

## API Endpoints

### Autenticação
- `POST /api/auth/login`

### Clientes
- `GET /api/customers`
- `GET /api/customers/{id}`
- `POST /api/customers`
- `PUT /api/customers/{id}`
- `DELETE /api/customers/{id}`
- `GET /api/customers/{id}/transport-types`
- `POST /api/customers/{id}/transport-types`
- `DELETE /api/customers/{id}/transport-types/{transportTypeId}`

### Itens
- `GET /api/items`
- `GET /api/items/{id}`
- `POST /api/items`
- `PUT /api/items/{id}`
- `DELETE /api/items/{id}`

### Tipos de Transporte
- `GET /api/transporttypes`
- `GET /api/transporttypes/{id}`
- `POST /api/transporttypes`
- `PUT /api/transporttypes/{id}`
- `DELETE /api/transporttypes/{id}`

### Ordens de Venda
- `GET /api/orders?status=&customerId=&transportTypeId=&startDate=&endDate=`
- `GET /api/orders/{id}`
- `POST /api/orders`
- `POST /api/orders/{id}/items`
- `DELETE /api/orders/{id}/items/{itemId}`
- `PUT /api/orders/{id}/plan`
- `PUT /api/orders/{id}/schedule`
- `PUT /api/orders/{id}/start-transport`
- `PUT /api/orders/{id}/deliver`
- `PUT /api/orders/{id}/cancel`

### Agendamento
- `GET /api/orders/{orderId}/delivery`
- `POST /api/orders/{orderId}/delivery`

### Dashboard
- `GET /api/dashboard`

### Auditoria
- `GET /api/auditlogs?page=1&pageSize=10`

## Escalabilidade

- **SQLite**: Adequado para single-server e desenvolvimento. Para produção, migrar para PostgreSQL
  ou SQL Server alterando a connection string e driver EF Core.
- **Cache**: Implementar Redis para otimizar consultas de dashboard e listagens frequentes.
- **Read Model**: Para consultas complexas, considerar CQRS com projeções materializadas.
- **Stateless**: API sem estado de sessão permite escalonamento horizontal com load balancer.

## Performance

- **N+1 Queries**: Evitado com `Include()` e `ThenInclude()` nas consultas
- **Pagination**: Endpoint de auditoria com paginação (page/pageSize)
- **Indexes**: EF Core cria índices por padrão para FKs
- **Lazy Loading**: Desabilitado — todas as cargas são explícitas (eager loading)

## Trade-offs

| Decisão | Trade-off |
|---------|-----------|
| SQLite | Simplicidade de setup vs. concorrência limitada |
| EF Core InMemory nos testes | Velocidade vs. fidelidade com SQLite real |
| Domain models como responses | Simplicidade vs. acoplamento API-domínio |
| Auditoria síncrona | Consistência vs. impacto na latência |
| Sem fila de eventos | Simplicidade vs. resiliência em falhas |
| Cancelamento remove ordem | Simplicidade vs. rastreabilidade |
