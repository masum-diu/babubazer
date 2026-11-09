<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->foreignId('product_color_id')->nullable()->after('product_id')->constrained()->nullOnDelete();
            $table->foreignId('product_size_id')->nullable()->after('product_color_id')->constrained()->nullOnDelete();
            $table->foreignId('product_variant_id')->nullable()->after('product_size_id')->constrained()->nullOnDelete();
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('color_name')->nullable()->after('product_name');
            $table->string('size_name')->nullable()->after('color_name');
            $table->foreignId('product_variant_id')->nullable()->after('product_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('product_variant_id');
            $table->dropColumn(['color_name', 'size_name']);
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('product_variant_id');
            $table->dropConstrainedForeignId('product_size_id');
            $table->dropConstrainedForeignId('product_color_id');
        });
    }
};
