<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_colors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('hex', 20)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('product_color_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_color_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('product_sizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_color_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('product_size_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('stock')->default(0);
            $table->timestamps();

            $table->unique(
                ['product_id', 'product_color_id', 'product_size_id'],
                'product_variants_unique_combo',
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('product_sizes');
        Schema::dropIfExists('product_color_images');
        Schema::dropIfExists('product_colors');
    }
};
