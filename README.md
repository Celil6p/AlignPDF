# AlignPDF

![AlignPDF Demo](AlignPDF.gif)

AlignPDF is a powerful, user-friendly web application for splitting and merging PDF files. Built with privacy and persistence in mind, it leverages IndexedDB through Dexie.js to ensure your work is always saved, even if your browser unexpectedly closes.

## Key Features

- **Split PDF Files**: Easily extract specific pages or ranges from your PDFs
- **Merge PDF Files**: Combine multiple PDFs into a single document with a few clicks
- **Automatic Progress Saving**: Never lose your work again! All changes are instantly saved to IndexedDB
- **Offline Capability**: Continue working even without an internet connection
- **Complete Privacy**: All processing happens in your browser - no files are ever uploaded to a server
- **User-Friendly Interface**: Intuitive design makes PDF manipulation a breeze
- **No Installation Required**: Works directly in your web browser on any device

## Why AlignPDF?

- **Persistent Storage with IndexedDB and Dexie.js**: 
  - Your work is automatically saved after every action
  - Seamlessly resume your session, even after closing your browser
  - Efficiently handles large PDF files without performance issues

- **Enhanced Privacy**:
  - All PDF processing occurs locally in your browser
  - No server uploads mean your sensitive documents stay on your device
  - No account creation or personal information required

- **User-Centric Design**:
  - Clean, intuitive interface for effortless PDF manipulation
  - Responsive design works on desktop and mobile devices
  - Helpful tooltips and clear instructions guide you through each step

## Getting Started

1. Open AlignPDF in your web browser at [https://alignpdf.celilaltiparmak.com](https://alignpdf.celilaltiparmak.com) or [https://alignpdf.com](https://alignpdf.com) for vercel deployment
2. Upload your PDF file(s) using the "Add PDF" button
3. Use the split or merge functions as needed
4. Download your modified PDF(s)
5. Your progress is automatically saved - come back anytime to continue where you left off!

## Development

From your terminal:

```sh
pnpm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
pnpm run build
```

Then run the app in production mode:

```sh
pnpm start
```

### Self-Hosting Guide

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`:

- `build/`
- `public/build/`

1. Choose a hosting provider that supports Node.js applications (e.g., DigitalOcean, Heroku, AWS).
2. Set up your server environment with Node.js installed.
3. Clone this repository to your server.
4. Run `pnpm install` to install dependencies.
5. Set any necessary environment variables.
6. Build the application using `pnpm run build`.
7. Start the server using `pnpm start`.
8. Configure your web server (e.g., Nginx) to proxy requests to the Remix app server.

## Technical Details

- Built with Remix
- Uses IndexedDB for client-side storage
- Supports modern web browsers

## Privacy

AlignPDF processes your PDFs entirely in the browser. No files are uploaded to any server, ensuring your documents remain private.

## Support

If you encounter any issues or have questions, please open an issue in this repository.

## License

[MIT License](LICENSE)

