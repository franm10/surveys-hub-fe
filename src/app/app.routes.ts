import { RouterModule, Routes } from '@angular/router';

/* Project Component */
import { TokenPageComponent } from './test/token-page/token-page.component';
import { NotFoundRedirectComponent } from './template/components/not-found-redirect/not-found-redirect.component';

/* Sub-Routes */
import { homeRoutes } from './home/services/home.routes';
import { authRoutes } from './auth/auth.routes';
import { adminRoutes} from './admin/services/admin.routes';
import { userRoutes } from './user/services/user.routes';

export const routesConfig: Routes = [
    ...homeRoutes,
    ...authRoutes,
    ...adminRoutes,
    ...userRoutes,
    { path: 'token', component: TokenPageComponent },   // test
    { path: '**', component: NotFoundRedirectComponent }
];
