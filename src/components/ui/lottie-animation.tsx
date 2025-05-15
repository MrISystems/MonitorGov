import { useLottie, LottieOptions } from 'lottie-react';
import { cn } from '@/lib/utils';

interface LottieAnimationProps extends Partial<LottieOptions> {
  animationData: any;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  height?: number | string;
  width?: number | string;
}

export function LottieAnimation({
  animationData,
  className,
  loop = true,
  autoplay = true,
  speed = 1,
  height = '100%',
  width = '100%',
  ...props
}: LottieAnimationProps) {
  const options = {
    animationData,
    loop,
    autoplay,
    ...props,
  };

  const { View } = useLottie(options);

  return (
    <div
      className={cn('lottie-container', className)}
      style={{
        height,
        width,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {View}
    </div>
  );
}

// Componentes específicos para diferentes estados
export function LoadingAnimation() {
  return (
    <LottieAnimation
      animationData={require('@/public/animations/loading.json')}
      loop={true}
      autoplay={true}
      height={200}
      width={200}
    />
  );
}

export function SuccessAnimation() {
  return (
    <LottieAnimation
      animationData={require('@/public/animations/success.json')}
      loop={false}
      autoplay={true}
      height={200}
      width={200}
    />
  );
}

export function ErrorAnimation() {
  return (
    <LottieAnimation
      animationData={require('@/public/animations/error.json')}
      loop={false}
      autoplay={true}
      height={200}
      width={200}
    />
  );
}

export function EmptyStateAnimation() {
  return (
    <LottieAnimation
      animationData={require('@/public/animations/empty-state.json')}
      loop={true}
      autoplay={true}
      height={300}
      width={300}
    />
  );
}

export function WelcomeAnimation() {
  return (
    <LottieAnimation
      animationData={require('@/public/animations/welcome.json')}
      loop={true}
      autoplay={true}
      height={400}
      width={400}
    />
  );
}
