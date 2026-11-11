<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SitePage;
use App\Support\ImageUpload;
use App\Support\SiteDefaults;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SitePageController extends Controller
{
    private const STRUCTURED_FIELDS = [
        'banner_slides',
    ];

    private const IMAGE_FIELDS = [
        'hero_image',
        'story_image',
        'side_image',
    ];

    public function edit(Request $request): Response
    {
        SitePage::ensureDefaults();

        $slug = $request->string('page')->toString() ?: 'home';
        $defaults = SiteDefaults::all();

        if (! isset($defaults[$slug])) {
            $slug = 'home';
        }

        $page = SitePage::query()->where('slug', $slug)->firstOrFail();

        return Inertia::render('admin/pages/edit', [
            'page' => [
                'slug' => $page->slug,
                'title' => $page->title,
                'content' => SitePage::content($slug),
            ],
            'pages' => collect($defaults)->map(fn ($meta, $key) => [
                'slug' => $key,
                'title' => $meta['title'],
            ])->values(),
            'fields' => $this->fieldsFor($slug),
        ]);
    }

    public function update(Request $request, string $page): RedirectResponse
    {
        $defaults = SiteDefaults::all();

        abort_unless(isset($defaults[$page]), 404);

        $allowed = array_keys($defaults[$page]['content']);
        $imageKeys = array_values(array_intersect($allowed, self::IMAGE_FIELDS));
        $structuredKeys = array_values(array_intersect($allowed, self::STRUCTURED_FIELDS));
        $textKeys = array_values(array_diff($allowed, [...$imageKeys, ...$structuredKeys]));

        $rules = collect($textKeys)->mapWithKeys(
            fn ($key) => [$key => ['nullable', 'string', 'max:2000']],
        )->all();

        foreach ($imageKeys as $key) {
            $rules[$key] = ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:1024'];
        }

        if (in_array('banner_slides', $structuredKeys, true)) {
            $rules['banner_slides'] = ['required', 'array', 'min:1', 'max:6'];
            $rules['banner_slides.*.brand'] = ['nullable', 'string', 'max:120'];
            $rules['banner_slides.*.title'] = ['required', 'string', 'max:200'];
            $rules['banner_slides.*.text'] = ['nullable', 'string', 'max:1000'];
            $rules['banner_slides.*.image'] = ['nullable', 'string', 'max:2000'];
            $rules['banner_slides.*.image_file'] = ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:1024'];
            $rules['banner_slides.*.primary'] = ['nullable', 'string', 'max:100'];
            $rules['banner_slides.*.primary_url'] = ['nullable', 'string', 'max:2000'];
            $rules['banner_slides.*.secondary'] = ['nullable', 'string', 'max:100'];
            $rules['banner_slides.*.secondary_url'] = ['nullable', 'string', 'max:2000'];
        }

        $validated = $request->validate($rules);

        $sitePage = SitePage::query()->firstOrCreate(
            ['slug' => $page],
            [
                'title' => $defaults[$page]['title'],
                'content' => $defaults[$page]['content'],
            ],
        );

        $content = $sitePage->content ?? [];

        foreach ($textKeys as $key) {
            if (array_key_exists($key, $validated)) {
                $content[$key] = (string) ($validated[$key] ?? '');
            }
        }

        if (in_array('banner_slides', $structuredKeys, true)) {
            $slides = $validated['banner_slides'];
            $oldImages = collect($content['banner_slides'] ?? [])
                ->pluck('image')
                ->filter()
                ->all();

            foreach ($slides as $index => $slide) {
                $imageFile = $request->file("banner_slides.$index.image_file");

                if (! $imageFile && empty($slide['image'])) {
                    throw ValidationException::withMessages([
                        "banner_slides.$index.image" => 'Please upload an image for this banner slide.',
                    ]);
                }
            }

            foreach ($slides as $index => &$slide) {
                $imageFile = $request->file("banner_slides.$index.image_file");
                if ($imageFile) {
                    $slide['image'] = ImageUpload::store($imageFile, 'banners');
                }
                unset($slide['image_file']);
            }
            unset($slide);

            $newImages = collect($slides)->pluck('image')->filter()->all();
            foreach (array_diff($oldImages, $newImages) as $oldImage) {
                ImageUpload::delete($oldImage);
            }

            $content['banner_slides'] = $slides;
        }

        foreach ($imageKeys as $key) {
            $file = $request->file($key);
            if ($file && ! is_array($file)) {
                ImageUpload::delete($content[$key] ?? null);
                $content[$key] = ImageUpload::store($file, 'pages');
            }
        }

        $sitePage->update(['content' => $content]);

        return back()->with('success', ucfirst($page).' page content updated.');
    }

    /**
     * @return list<array{key: string, label: string, type: string}>
     */
    private function fieldsFor(string $slug): array
    {
        $labels = [
            'home' => [
                'banner_slides' => 'Banner slides',
                'categories_eyebrow' => 'Categories eyebrow',
                'categories_title' => 'Categories title',
                'featured_eyebrow' => 'Featured eyebrow',
                'featured_title' => 'Featured title',
                'promises_eyebrow' => 'Promises eyebrow',
                'promises_title' => 'Promises title',
                'promise_1_title' => 'Promise 1 title',
                'promise_1_text' => 'Promise 1 text',
                'promise_2_title' => 'Promise 2 title',
                'promise_2_text' => 'Promise 2 text',
                'promise_3_title' => 'Promise 3 title',
                'promise_3_text' => 'Promise 3 text',
            ],
            'about' => [
                'hero_image' => 'Hero image',
                'hero_brand' => 'Hero brand',
                'hero_title' => 'Hero title',
                'hero_text' => 'Hero text',
                'story_eyebrow' => 'Story eyebrow',
                'story_title' => 'Story title',
                'story_text' => 'Story text',
                'story_image' => 'Story image',
                'story_image_caption' => 'Story image caption',
                'pillar_1_title' => 'Pillar 1 title',
                'pillar_1_text' => 'Pillar 1 text',
                'pillar_2_title' => 'Pillar 2 title',
                'pillar_2_text' => 'Pillar 2 text',
                'pillar_3_title' => 'Pillar 3 title',
                'pillar_3_text' => 'Pillar 3 text',
                'cta_eyebrow' => 'CTA eyebrow',
                'cta_title' => 'CTA title',
                'cta_text' => 'CTA text',
                'cta_button' => 'CTA button text',
                'cta_button_url' => 'CTA button URL',
            ],
            'contact' => [
                'hero_brand' => 'Hero brand',
                'hero_title' => 'Hero title',
                'hero_text' => 'Hero text',
                'reach_eyebrow' => 'Reach eyebrow',
                'reach_title' => 'Reach title',
                'address_label' => 'Address label',
                'address' => 'Address',
                'phone_label' => 'Phone label',
                'phone' => 'Phone',
                'email_label' => 'Email label',
                'email' => 'Email',
                'hours_label' => 'Hours label',
                'hours' => 'Hours',
                'side_image' => 'Side image',
                'form_eyebrow' => 'Form eyebrow',
                'form_title' => 'Form title',
                'form_success' => 'Form success message',
                'form_button' => 'Form button text',
            ],
            'footer' => [
                'blurb' => 'Footer blurb',
                'links_title' => 'Links title',
                'support_title' => 'Support title',
                'hotline' => 'Hotline',
                'email' => 'Email',
                'note' => 'Support note',
                'copyright_suffix' => 'Copyright suffix',
            ],
        ];

        $long = [
            'hero_text',
            'story_text',
            'cta_text',
            'blurb',
            'pillar_1_text',
            'pillar_2_text',
            'pillar_3_text',
            'promise_1_text',
            'promise_2_text',
            'promise_3_text',
            'form_success',
        ];

        return collect($labels[$slug] ?? [])
            ->map(fn ($label, $key) => [
                'key' => $key,
                'label' => $label,
                'type' => in_array($key, self::IMAGE_FIELDS, true)
                    ? 'image'
                    : (in_array($key, self::STRUCTURED_FIELDS, true)
                        ? 'slides'
                        : (in_array($key, $long, true) ? 'textarea' : 'text')),
            ])
            ->values()
            ->all();
    }
}
