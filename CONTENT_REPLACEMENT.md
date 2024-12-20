# Инструкции по замене контента

## Замена домена

1. Выполните поиск и замену во всех файлах:
   ```bash
   # Для Linux/Mac
   find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -exec sed -i 's/example\.com/your-domain.com/g' {} +
   
   # Для Windows (PowerShell)
   Get-ChildItem -Recurse -File | Where-Object { $_.FullName -notmatch 'node_modules|\.git' } | ForEach-Object { (Get-Content $_.FullName) | ForEach-Object { $_ -replace 'example\.com', 'your-domain.com' } | Set-Content $_.FullName }
   ```

2. Проверьте следующие файлы вручную:
   - Все файлы в `frontend/src/pages/`
   - `frontend/public/robots.txt`
   - `frontend/src/config/api.ts`
   - Все файлы `.env*`

## Замена тематики

1. Замените все упоминания анекдотов и шуток на вашу тематику:

### SEO-шаблоны (`backend/src/models/Section.ts`):
```typescript
return `${this.title} - [Ваша тематика] | [Название сайта]`;
return `Коллекция [вашей тематики] в категории "${this.title}". [Описание]`;
return `[ключевые], [слова], [через], [запятую]`;
```

### Компоненты (`frontend/src/components/`):
- Footer.tsx: Измените описание проекта
- Header.tsx: Измените заголовок и подзаголовок
- Sidebar.tsx: Обновите пункты меню
- TopContent.tsx: Измените описания разделов

### Страницы (`frontend/src/pages/`):
- index.tsx: Обновите мета-теги и заголовки
- about.tsx: Измените описание проекта
- contact.tsx: Обновите контактную информацию

### Шаблоны (`default-content.json`):
```json
{
  "site": {
    "name": "[Название вашего сайта]",
    "description": "[Описание вашего сайта]"
  },
  "sections": {
    "main": {
      "title": "[Главный заголовок]",
      "description": "[Описание главной страницы]"
    }
  }
}
```

## Проверка после замены

1. Проверьте все URL:
   ```bash
   grep -r "http" .
   ```

2. Проверьте все мета-теги:
   ```bash
   grep -r "meta.*content" frontend/src/pages/
   ```

3. Проверьте все заголовки:
   ```bash
   grep -r "title" frontend/src/pages/
   ```

4. Проверьте описания:
   ```bash
   grep -r "description" .
   ```

## Важные моменты

1. SEO:
   - Все мета-теги должны быть уникальными
   - Описания должны быть информативными (150-160 символов)
   - Ключевые слова должны быть релевантными

2. Контент:
   - Все тексты должны соответствовать вашей тематике
   - Проверьте грамматику и орфографию
   - Убедитесь, что все ссылки работают

3. Брендинг:
   - Замените все упоминания оригинального бренда
   - Обновите копирайты и правовую информацию
   - Проверьте социальные ссылки 