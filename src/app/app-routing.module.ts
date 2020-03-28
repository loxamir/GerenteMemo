import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'product', loadChildren: './product/product.module#ProductPageModule' },
  { path: 'product-category', loadChildren: './product-category/product-category.module#ProductCategoryPageModule' },
  { path: 'product-category-list', loadChildren: './product-category-list/product-category-list.module#ProductCategoryListPageModule' },
  { path: 'product-list', loadChildren: './product-list/product-list.module#ProductListPageModule' },
  { path: 'config', loadChildren: './config/config.module#ConfigPageModule' },
  { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'image-modal', loadChildren: './image-modal/image-modal.module#ImageModalPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
