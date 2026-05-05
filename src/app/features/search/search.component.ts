import { Component, ElementRef, inject, viewChild, effect, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AppStore } from '../../core/store/app.store';
import { TuiIcon, TuiLoader, TuiDataList, TuiDropdown } from '@taiga-ui/core';
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { DeezerService } from '../../core/services/deezer.service';
import { lastValueFrom, debounceTime, distinctUntilChanged } from 'rxjs';
import { DurationPipe } from '../../core/pipes/duration.pipe';
import { SearchItem, Track, Album } from '../../core/models/track.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [TuiIcon, TuiLoader, TuiDataList, TuiDropdown, DurationPipe],
  templateUrl: './search.component.html',
})
export class SearchComponent {
  protected readonly store = inject(AppStore);
  private readonly deezer = inject(DeezerService);
  private readonly sentinel = viewChild<ElementRef>('sentinel');

  protected readonly debouncedSearchTerm = toSignal(
    toObservable(this.store.searchTerm).pipe(
      debounceTime(500),
      distinctUntilChanged()
    ),
    { initialValue: this.store.searchTerm() }
  );

  private readonly tracksQuery = injectInfiniteQuery(() => ({
    queryKey: ['search', 'tracks', this.debouncedSearchTerm()],
    queryFn: ({ pageParam }) => lastValueFrom(this.deezer.searchTracks(this.debouncedSearchTerm() || '', pageParam)),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => this.parseNextIndex(lastPage.next),
    enabled: !!this.debouncedSearchTerm(),
  }));

  private readonly artistsQuery = injectInfiniteQuery(() => ({
    queryKey: ['search', 'artists', this.debouncedSearchTerm()],
    queryFn: ({ pageParam }) => lastValueFrom(this.deezer.searchArtists(this.debouncedSearchTerm() || '', pageParam)),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => this.parseNextIndex(lastPage.next),
    enabled: !!this.debouncedSearchTerm(),
  }));

  private readonly albumsQuery = injectInfiniteQuery(() => ({
    queryKey: ['search', 'albums', this.debouncedSearchTerm()],
    queryFn: ({ pageParam }) => lastValueFrom(this.deezer.searchAlbums(this.debouncedSearchTerm() || '', pageParam)),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => this.parseNextIndex(lastPage.next),
    enabled: !!this.debouncedSearchTerm(),
  }));

  protected readonly allTracks = computed(() => this.tracksQuery.data()?.pages.flatMap(p => p.data) ?? []);
  protected readonly allArtists = computed(() => this.artistsQuery.data()?.pages.flatMap(p => p.data) ?? []);
  protected readonly allAlbums = computed(() => this.albumsQuery.data()?.pages.flatMap(p => p.data) ?? []);

  protected readonly firstPageTracks = computed(() => this.tracksQuery.data()?.pages[0]?.data ?? []);
  protected readonly firstPageArtists = computed(() => this.artistsQuery.data()?.pages[0]?.data ?? []);
  protected readonly firstPageAlbums = computed(() => this.albumsQuery.data()?.pages[0]?.data ?? []);

  protected readonly activeQuery = computed(() => {
    const tab = this.store.activeTab();
    if (tab === 'Tracks') return this.tracksQuery;
    if (tab === 'Artists') return this.artistsQuery;
    if (tab === 'Albums') return this.albumsQuery;
    return null;
  });
  
  isloading() {
    const query = this.activeQuery();
    return query ? query.isLoading() : false;
  }

  constructor() {
    effect(() => {
      const element = this.sentinel()?.nativeElement;
      const query = this.activeQuery();
      if (!element || !query) return;

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && query.hasNextPage() && !query.isFetchingNextPage()) {
          query.fetchNextPage();
        }
      });

      observer.observe(element);
      return () => observer.disconnect();
    });
  }

  private parseNextIndex(nextUrl?: string): number | undefined {
    if (!nextUrl) return undefined;
    const url = new URL(nextUrl);
    const index = url.searchParams.get('index');
    return index ? parseInt(index, 10) : undefined;
  }

  protected readonly topResult = computed<SearchItem | null>(() => {
    const tracks = this.firstPageTracks();
    if (tracks.length === 0) return null;

    if (tracks.length >= 2 && tracks[0].artist.id === tracks[1].artist.id) {
      const artist = this.firstPageArtists().find(a => a.id === tracks[0].artist.id);
      if (artist) return artist;
    }

    if (
      tracks.length >= 3 &&
      tracks[0].album.id === tracks[1].album.id &&
      tracks[1].album.id === tracks[2].album.id
    ) {
      const album = this.firstPageAlbums().find(a => a.id === tracks[0].album.id);
      if (album) return album;
    }

    return tracks[0];
  });

  getHeroTitle(item: SearchItem): string {
    return item.type === 'artist' ? item.name : item.title;
  }

  getHeroSubtitle(item: SearchItem): string {
    if (item.type === 'track') return item.artist.name;
    if (item.type === 'album') return item.artist.name;
    return 'Artist';
  }

  getHeroImage(item: SearchItem): string {
    if (item.type === 'artist') return item.picture_xl || item.picture_medium;
    if (item.type === 'album') return item.cover_medium;
    return item.album.cover_medium;
  }

  playHero(item: SearchItem): void {
    if (item.type === 'track') this.store.playTrackNow(item);
    else if (item.type === 'album') this.playAlbum(item);
  }

  playTrack(track: Track): void {
    this.store.playTrackNow(track);
  }

  playAlbum(album: Album): void {
    this.deezer.getAlbumTracks(album.id).subscribe(({ data }) => {
      this.store.playTracklistNow(data, 0);
    });
  }

  addToQueue(track: Track): void {
    this.store.addToQueue(track);
  }
}
