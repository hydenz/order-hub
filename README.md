# OrderHub

Sistema de gerenciamento de pedidos — projeto full-stack com ASP.NET Core + React.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Estilização | Tailwind CSS v4 (tema escuro) |
| Backend | ASP.NET Core Web API (.NET 10) |
| Banco | SQLite via Entity Framework Core |
| Auth | JWT (Bearer token) |

## Arquitetura

### Frontend (`/frontend`)

```
src/
├── api/client.ts          # Axios com interceptor JWT
├── components/            # Sidebar, Modal, StatCard
├── contexts/              # AuthContext + useAuth
├── pages/                 # Dashboard, Orders, Login, etc.
├── types/                 # Interfaces TypeScript
└── utils/format.ts        # Formatação BRL
```

O frontend consome a API via Axios com `baseURL` apontando para `http://localhost:5000/api`. Um interceptor anexa o token JWT automaticamente e redireciona para `/login` em caso de 401.

A proteção de rotas é feita no `App.tsx`: se o usuário não está autenticado, apenas a tela de login é renderizada.

### Backend (`/backend`)

```
Controllers/       # Auth, Customers, Orders, etc.
Models/            # Entidades (User, Order, Item, etc.)
Services/          # Regras de negócio (interface + implementação)
Data/
├── AppDbContext   # EF Core DbContext
└── DbSeeder       # Dados iniciais
Migrations/        # Migrations do EF Core
```

Arquitetura em camadas: **Controller → Service (interface/impl) → DbContext**.

Todos os endpoints (exceto `/api/auth/login`) exigem `[Authorize]`. A autenticação é feita via JWT com BCrypt para hash de senha.

## Como rodar

### Backend

```bash
cd backend
dotnet restore
dotnet run
```

O servidor inicia em `http://localhost:5000`. Na primeira execução, as migrations são aplicadas automaticamente e o banco é populado com dados de exemplo.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O servidor de desenvolvimento inicia em `http://localhost:3000`.

### Credenciais de acesso

| Usuário | Senha |
|---------|-------|
| `admin` | `admin123` |

## Funcionalidades

- Autenticação JWT com login
- CRUD de clientes, itens, transportes
- Ciclo de vida de pedidos (Rascunho → Confirmado → Enviado → Entregue / Cancelado)
- Agendamento de entregas
- Dashboard com estatísticas
- Log de auditoria para alterações
- Tema escuro com formatação em Real (BRL)
