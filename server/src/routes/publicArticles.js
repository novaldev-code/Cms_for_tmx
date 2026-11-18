import { Router } from 'express';
import {
  getPublicArticle,
  listPublicArticles,
} from '../controllers/publicArticlesController.js';

export const publicArticlesRouter = Router();

publicArticlesRouter.get('/', listPublicArticles);
publicArticlesRouter.get('/:slug', getPublicArticle);
