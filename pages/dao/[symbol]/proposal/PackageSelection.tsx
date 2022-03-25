export type PackageName = 'raydium' | 'friktion' | 'solend'

const PackageSelection = ({
  selected,
  onClick,
}: {
  selected: PackageName | null
  onClick: (selected: PackageName) => void
}) => {
  const packages: PackageName[] = ['raydium', 'friktion', 'solend']

  return (
    <div className="flex space-x-3">
      {packages.map((packageName) => (
        <img
          key={packageName}
          src={`/img/${packageName}.png`}
          className={`h-6 w-6 hover:grayscale-0 ${
            selected !== packageName ? 'grayscale' : ''
          } cursor-pointer`}
          onClick={() => onClick(packageName)}
        />
      ))}
    </div>
  )
}

export default PackageSelection
