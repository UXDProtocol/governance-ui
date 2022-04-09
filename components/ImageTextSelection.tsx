export type ImageTextElement<T> = {
  id: T;
  name: string;
  image?: string;
};

export default function ImageTextSelection<T>({
  selected,
  className,
  onClick,
  imageTextElements,
}: {
  selected: T | null;
  className?: string;
  onClick: (selected: T) => void;
  imageTextElements: ImageTextElement<T>[];
}) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {imageTextElements.map(({ id, name, image }, index) => {
        if (image) {
          return (
            <img
              title={name}
              key={index}
              style={{
                boxShadow: selected === id ? '0 0 8px 4px #aeaeae' : 'none',
              }}
              src={image}
              className={`h-6 max-w-6 p-0.5 rounded-full hover:grayscale-0 ${
                selected !== id ? 'grayscale' : ''
              } cursor-pointer`}
              onClick={() => onClick(id)}
            />
          );
        }

        // There is no image, we use the text instead
        return (
          <span
            style={{
              boxShadow: selected === id ? '0 0 8px 4px #aeaeae' : 'none',
            }}
            className={`text-xs hover:text-white pl-2 pr-2 pt-0.5 pb-0.5 rounded-full cursor-pointer ${
              selected !== id ? 'text-gray-400' : 'text-white'
            }`}
            onClick={() => onClick(id)}
            key={index}
          >
            {name}
          </span>
        );
      })}
    </div>
  );
}
