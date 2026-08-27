# نشر Mizan Tools وفهرسته

## عنوان الموقع

بعد تفعيل GitHub Pages من فرع `main`، يكون عنوان المشروع الافتراضي:

```text
https://majid-alsakani.github.io/mizan-tools/
```

النسخة تتضمن `robots.txt` و`sitemap.xml` في جذر الموقع، إضافة إلى ست صفحات هبوط مستقلة داخل `/tools/`. تستخدم خريطة الموقع روابط كاملة لأنها الصيغة التي توصي بها Google عند إدراج الصفحات المراد فهرستها.[^sitemap]

## خطوات Google Search Console

1. افتح [Google Search Console](https://search.google.com/search-console/about) وأضف Property من نوع **URL prefix** بعنوان الموقع كاملاً.
2. اختر التحقق عبر ملف HTML أو Google Analytics إذا كان متاحًا. لا تضف رموز التحقق إلى ملفات JavaScript.
3. بعد نجاح التحقق، افتح **Sitemaps** وأرسل `https://majid-alsakani.github.io/mizan-tools/sitemap.xml`.
4. استخدم **URL Inspection** للصفحة الرئيسية وصفحة واحدة لكل أداة، ثم اطلب الفهرسة بعد التأكد أن الصفحة عامة ولا تحتوي `noindex`.
5. راقب تقرير **Performance** أسبوعيًا: queries، impressions، clicks، average position، وCTR لكل صفحة أداة.

إرسال sitemap أو طلب الفهرسة لا يضمن ظهور الصفحة في نتائج البحث؛ إنه إشارة تساعد محرك البحث على اكتشاف الصفحات وتقييمها.[^sitemap]

## خطة نمو أول 30 يومًا

| الفترة | العمل | مقياس المتابعة |
|---|---|---|
| الأيام 1–3 | أضف الموقع وsitemap إلى Search Console وافحص URLs الأساسية | Coverage بلا أخطاء، ظهور URLs في الفهرسة |
| الأسبوع 1 | انشر شرحًا عربيًا عمليًا لفاحص RTL مع مثال قبل/بعد | impressions وCTR لصفحة RTL |
| الأسبوع 2 | انشر صفحة استخدام لمقارنة JSON في Pull Requests | زيارات صفحة JSON ونسخ التقرير |
| الأسبوع 3 | أضف FAQ حقيقيًا من أسئلة المستخدمين، لا حشو كلمات مفتاحية | queries طويلة الذيل ومعدل التفاعل |
| الأسبوع 4 | اختر أداة واحدة ذات طلب واضح وحسّن العنوان والوصف بناءً على Search Console | CTR وموقع الكلمات المهمة |

## معايير المحتوى

لا تنشئ صفحات متشابهة لغرض الكلمات المفتاحية فقط. كل صفحة أداة تحتاج عنوانًا واضحًا، وصفًا مباشرًا للمشكلة، الأداة ذاتها، مثال استخدام، حدود معلنة، ورابطًا طبيعيًا للصفحات ذات الصلة. احتفظ بالمحتوى مفيدًا للمطور العربي أولًا ثم أضف نسخة إنجليزية مستقلة عندما يكون لديك شرح مكافئ حقيقي.

[^sitemap]: [Google Search Central — Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
