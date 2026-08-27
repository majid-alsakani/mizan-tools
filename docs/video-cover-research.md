# Video Cover Inspector research

تم التحقق في أغسطس 2026 من مسارين رسميين يمكن للأداة الاعتماد عليهما بدون تنزيل الفيديو:

| المنصة | المسار | نتيجة التحقق |
| --- | --- | --- |
| YouTube | `https://www.youtube.com/oembed?format=json&url={videoUrl}` مع مرشحات صور `i.ytimg.com/vi/{id}/…` | أعاد oEmbed عنوان الفيديو واسم القناة، وعملت صورة `maxresdefault.jpg` في مثال التحقق |
| TikTok | `https://www.tiktok.com/oembed?url={videoUrl}` | أعاد oEmbed اسم المنشئ والعنوان و`thumbnail_url` في مثال TikTok الرسمي |

ستعرض الأداة رابط المصدر واسم المنشئ، ولن تنزل الفيديو أو تحوّل علامة/إسناد أو تتجاوز قيود المنصة. قد لا تتوفر أعلى دقة لكل فيديو في YouTube، لأن المنصة توضح أن أحجام thumbnail تختلف بحسب المورد ودقة المحتوى الأصلي.

## Browser validation

اختُبر الإصدار العملي برابط YouTube عام ورابط TikTok عام موثقين في أمثلة المنصتين. في حالة YouTube ظهرت بيانات الفيديو واسم القناة وغلاف `1280 × 720` مع خيار تنزيل مخصص للاستخدام المصرح. في حالة TikTok ظهرت بيانات المنشئ وغلاف `576 × 1024` ووصلة الغلاف الأصلية؛ لا يظهر زر تنزيل Blob لـ TikTok لأن CDN الخاص به لم يوفّر CORS مناسبًا لجلب ملف الصورة من المتصفح، لكن رابط المصدر يبقى متاحًا.

## Sources

- [YouTube Data API — Thumbnails](https://developers.google.com/youtube/v3/docs/thumbnails)
- [TikTok for Developers — Embed Videos / oEmbed](https://developers.tiktok.com/doc/embed-videos/)
- [oEmbed specification](https://oembed.com/)
