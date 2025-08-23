import Image from 'next/image'

export default function ActivityIndicator() {
  return (
    <div className='text-center opacity-50 dark:invert flex justify-center'>
      <Image alt="loading" src="/static/images/spinner.svg" width={18} height={18} />
    </div>
  )
}