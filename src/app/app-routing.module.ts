import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  // { path: ':database', redirectTo: 'product-list', pathMatch: 'full' },
  // { path: 'product', loadChildren: './product/product.module#ProductPageModule' },
  // { path: 'product-list', loadChildren: './product-list/product-list.module#ProductListPageModule' },
  { path: ':database', loadChildren: './product-list/product-list.module#ProductListPageModule' },
  { path: ':database/:_id', loadChildren: './product/product.module#ProductPageModule' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
