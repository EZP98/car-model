# ALF Portfolio MCP Server

Server MCP per accedere direttamente al database del portfolio e gestire le traduzioni.

## Setup

1. Installa le dipendenze:
   ```bash
   npm install
   ```

2. Compila il TypeScript:
   ```bash
   npm run build
   ```

3. Crea il file `.env` con le configurazioni:
   ```bash
   API_URL=http://localhost:8787
   API_KEY=your-api-key
   ```

## Configurazione in Claude Code

Aggiungi questa configurazione al file `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "alf-portfolio": {
      "command": "node",
      "args": [
        "/Users/eziopappalardo/Documents/alf/artist-portfolio/mcp-server/dist/index.js"
      ],
      "env": {
        "API_URL": "http://localhost:8787",
        "API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Tool Disponibili

### 1. `list_items_missing_translations`
Elenca tutti gli item con traduzioni mancanti.

**Parametri:**
- `type`: 'exhibitions' | 'collections' | 'critics' | 'all'

**Esempio:**
```
list_items_missing_translations con type='all'
```

### 2. `get_item_for_translation`
Ottiene un item specifico con tutti i testi italiani (sorgente) da tradurre.

**Parametri:**
- `type`: 'exhibition' | 'collection' | 'critic'
- `id`: numero ID dell'item

**Esempio:**
```
get_item_for_translation con type='exhibition' id=1
```

### 3. `update_item_translations`
Aggiorna le traduzioni per un item.

**Parametri:**
- `type`: 'exhibition' | 'collection' | 'critic'
- `id`: numero ID dell'item
- `translations`: oggetto con le traduzioni (es: {"title_en": "...", "description_es": "..."})

**Esempio:**
```
update_item_translations con type='exhibition' id=1 translations={"title_en": "Reflections", "title_es": "Reflexiones"}
```

## Workflow Tipico

1. **Lista item mancanti:**
   ```
   Claude: list_items_missing_translations type='exhibitions'
   ```

2. **Ottieni item da tradurre:**
   ```
   Claude: get_item_for_translation type='exhibition' id=1
   ```

3. **Claude traduce i testi**

4. **Aggiorna con le traduzioni:**
   ```
   Claude: update_item_translations type='exhibition' id=1 translations={...}
   ```

## Come Usarlo

Una volta configurato, potrai dire a Claude:

- "Elencami tutte le mostre che hanno traduzioni mancanti"
- "Traduci la mostra ID 1 in tutte le lingue"
- "Aggiorna le traduzioni della collezione X"

Claude userà automaticamente questi tool per accedere e modificare il database!
