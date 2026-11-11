<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(private CartService $cart) {}

    public function index(Request $request): Response
    {
        return Inertia::render('cart/index', [
            'cart' => $this->cart->summary($request),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:20'],
            'product_color_id' => ['nullable', 'exists:product_colors,id'],
            'product_size_id' => ['nullable', 'exists:product_sizes,id'],
        ]);

        $product = Product::query()
            ->with(['colors', 'sizes', 'variants'])
            ->where('is_active', true)
            ->findOrFail($data['product_id']);

        $hasColors = $product->colors->isNotEmpty();
        $hasSizes = $product->sizes->isNotEmpty();

        if ($hasColors) {
            if (empty($data['product_color_id'])) {
                throw ValidationException::withMessages([
                    'product_color_id' => 'Please select a color.',
                ]);
            }

            if (! $product->colors->contains('id', (int) $data['product_color_id'])) {
                throw ValidationException::withMessages([
                    'product_color_id' => 'Please select a valid color.',
                ]);
            }
        }

        if ($hasSizes) {
            if (empty($data['product_size_id'])) {
                throw ValidationException::withMessages([
                    'product_size_id' => 'Please select a size.',
                ]);
            }

            if (! $product->sizes->contains('id', (int) $data['product_size_id'])) {
                throw ValidationException::withMessages([
                    'product_size_id' => 'Please select a valid size.',
                ]);
            }
        }

        $this->cart->add(
            $request,
            $product,
            $data['quantity'] ?? 1,
            isset($data['product_color_id']) ? (int) $data['product_color_id'] : null,
            isset($data['product_size_id']) ? (int) $data['product_size_id'] : null,
        );

        return back()->with('success', 'Added to cart');
    }

    public function update(Request $request, CartItem $cartItem): RedirectResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:0', 'max:20'],
        ]);

        $this->cart->update($request, $cartItem, $data['quantity']);

        return back();
    }

    public function destroy(Request $request, CartItem $cartItem): RedirectResponse
    {
        $this->cart->remove($request, $cartItem);

        return back()->with('success', 'Item removed');
    }
}
