# 🧪 Prova Prática – Galeria de Imagens

## 🎯 Objetivo

Criar uma aplicação de galeria de imagens com funcionalidades de **listagem, criação, edição, exclusão e ativação/desativação de itens**, utilizando:

- **Next.js 14 (SSG)**
- **React Hook Form + Zod**
- **Fastify + Prisma (backend)**

---

## ✅ Funcionalidades Obrigatórias

### 1️⃣ Separar componente `GalleryGrid`
- Criar **`GalleryItem.tsx`**
- Cada imagem da galeria deve ser um **`GalleryItem`**

### 2️⃣ Componente `GalleryItem`
- Exibir:
  - **Título**
  - **Imagem**
- Botões:
  - 🖉 **Editar**
  - 🗑️ **Deletar**
  - 🔌 **Ativar/Desativar**
    - Ícones coloridos:
      - 🟢 Ativo
      - 🔴 Inativo
    - **SweetAlert** para confirmação da ação

### 3️⃣ Página de edição `/edit/[id]`
- **Navegação:** `Link` do Next.js
- **Pré-carregar dados** da galeria pelo `id`
- Permitir **editar título e imagem**

### 4️⃣ Rotas do Backend (Fastify)
| Método  | Rota                   | Ação                         |
| ------- | ---------------------- | ---------------------------- |
| `DELETE`| `/gallery/:id`         | Deletar galeria              |
| `PUT`   | `/gallery/:id`         | Editar título e imagem       |
| `PATCH` | `/gallery/:id/active`  | Ativar/Desativar galeria     |

Essas rotas são usadas no componente `GalleryItem`.

---

## 🚀 Desafios Extras (Opcional)

### 📄 Paginação
- Exibir **12 itens por página**
- **SSG** com `revalidate`
- Botões **Próxima / Anterior**

### 🏷️ Filtro por Status
- Botões para filtrar:
  - 🔘 Todos
  - ✅ Ativos
  - ❌ Inativos
- **Manter filtro ao navegar entre páginas**

###  Responsividade
- **Tornar o layout responsivo**
  - **Grande (desktop)**
  - **Médio (tablet)**
  - **Pequeno (mobile)**

---
## 
 - Não esquecer de fazer build para verificar se existe algum conflito no FRONTEND

## ⚙️ Tecnologias Utilizadas

- **Next.js 14**
- **React Hook Form + Zod**
- **Fastify**
- **Prisma**
- **SweetAlert2**
- **TypeScript**


