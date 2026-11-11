<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\Admin\AttributeColorController as AdminColorController;
use App\Http\Controllers\Admin\AttributeSizeController as AdminSizeController;
use App\Http\Controllers\Admin\BulkProductController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\SalesReportController;
use App\Http\Controllers\Admin\SitePageController as AdminSitePageController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ShopController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::get('/about', AboutController::class)->name('about');
Route::get('/contact', ContactController::class)->name('contact');

Route::get('/shop', [ShopController::class, 'index'])->name('shop.index');
Route::get('/products/{slug}', [ShopController::class, 'show'])->name('products.show');

Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
Route::patch('/cart/{cartItem}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/{cartItem}', [CartController::class, 'destroy'])->name('cart.destroy');

Route::get('/checkout', [CheckoutController::class, 'create'])->name('checkout.create');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/orders/{order}', [CheckoutController::class, 'show'])->name('orders.show');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::get('/admin', [AuthController::class, 'showAdminLogin'])->name('admin.login');
Route::post('/admin/login', [AuthController::class, 'adminLogin'])->name('admin.login.submit');

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/account/orders', [AccountController::class, 'orders'])->name('account.orders');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::get('/media', [MediaController::class, 'index'])->name('media.index');
    Route::post('/media', [MediaController::class, 'store'])->name('media.store');
    Route::get('/products/import', [BulkProductController::class, 'index'])->name('products.import');
    Route::get('/products/import/template', [BulkProductController::class, 'template'])->name('products.import.template');
    Route::post('/products/import', [BulkProductController::class, 'upload'])->name('products.import.upload');
    Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
    Route::delete('/products', [AdminProductController::class, 'destroyAll'])->name('products.destroy-all');
    Route::get('/products/create', [AdminProductController::class, 'create'])->name('products.create');
    Route::post('/products', [AdminProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}/edit', [AdminProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{product}', [AdminProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])->name('products.destroy');

    Route::get('/categories', [AdminCategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [AdminCategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [AdminCategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('/colors', [AdminColorController::class, 'index'])->name('colors.index');
    Route::post('/colors', [AdminColorController::class, 'store'])->name('colors.store');
    Route::put('/colors/{color}', [AdminColorController::class, 'update'])->name('colors.update');
    Route::delete('/colors/{color}', [AdminColorController::class, 'destroy'])->name('colors.destroy');

    Route::get('/sizes', [AdminSizeController::class, 'index'])->name('sizes.index');
    Route::post('/sizes', [AdminSizeController::class, 'store'])->name('sizes.store');
    Route::put('/sizes/{size}', [AdminSizeController::class, 'update'])->name('sizes.update');
    Route::delete('/sizes/{size}', [AdminSizeController::class, 'destroy'])->name('sizes.destroy');

    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}', [AdminOrderController::class, 'update'])->name('orders.update');
    Route::get('/reports/sales/export', [SalesReportController::class, 'export'])->name('reports.sales.export');
    Route::get('/reports/sales', [SalesReportController::class, 'index'])->name('reports.sales');

    Route::get('/pages', [AdminSitePageController::class, 'edit'])->name('pages.edit');
    Route::put('/pages/{page}', [AdminSitePageController::class, 'update'])->name('pages.update');
});
