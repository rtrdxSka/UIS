import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/moodle-sync/moodle-sync.component').then(m => m.MoodleSyncComponent)
    }
];
