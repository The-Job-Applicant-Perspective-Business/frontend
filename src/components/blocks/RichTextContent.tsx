type RichTextContentProps = {
  htmlContent: string;
};

const RichTextContent = ({ htmlContent }: RichTextContentProps) => {
  return (
    <div
      className="rich-text-content prose prose-blue max-w-none focus:outline-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default RichTextContent;
