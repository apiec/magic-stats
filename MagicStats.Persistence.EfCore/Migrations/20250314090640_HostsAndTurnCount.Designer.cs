﻿// <auto-generated />
using System;
using MagicStats.Persistence.EfCore.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace MagicStats.Persistence.EfCore.Migrations
{
    [DbContext(typeof(StatsDbContext))]
    [Migration("20250314090640_HostsAndTurnCount")]
    partial class HostsAndTurnCount
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.10");

            modelBuilder.Entity("MagicStats.Persistence.EfCore.Entities.Commander", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("Commanders");
                });

            modelBuilder.Entity("MagicStats.Persistence.EfCore.Entities.Game", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("HostId")
                        .HasColumnType("INTEGER");

                    b.Property<long>("LastModified")
                        .HasColumnType("INTEGER");

                    b.Property<long>("PlayedAt")
                        .HasColumnType("INTEGER");

                    b.Property<int?>("TurnCount")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("HostId");

                    b.HasIndex("PlayedAt");

                    b.ToTable("Games");
                });

            modelBuilder.Entity("MagicStats.Persistence.EfCore.Entities.Host", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Irl")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(32)
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("Irl");

                    b.HasIndex("Name");

                    b.ToTable("Hosts");
                });

            modelBuilder.Entity("MagicStats.Persistence.EfCore.Entities.Participant", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("CommanderId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("GameId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("Placement")
                        .HasColumnType("INTEGER");

                    b.Property<int>("PlayerId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("StartingOrder")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("CommanderId");

                    b.HasIndex("PlayerId");

                    b.HasIndex("GameId", "PlayerId")
                        .IsUnique();

                    b.HasIndex("GameId", "PlayerId", "Placement");

                    b.HasIndex("GameId", "PlayerId", "StartingOrder")
                        .IsUnique();

                    b.ToTable("Participants");
                });

            modelBuilder.Entity("MagicStats.Persistence.EfCore.Entities.Player", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("Players");
                });

            modelBuilder.Entity("MagicStats.Persistence.EfCore.Entities.Game", b =>
                {
                    b.HasOne("MagicStats.Persistence.EfCore.Entities.Host", "Host")
                        .WithMany("Games")
                        .HasForeignKey("HostId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Host");
                });

            modelBuilder.Entity("MagicStats.Persistence.EfCore.Entities.Participant", b =>
                {
                    b.HasOne("MagicStats.Persistence.EfCore.Entities.Commander", "Commander")
                        .WithMany("Participated")
                        .HasForeignKey("CommanderId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("MagicStats.Persistence.EfCore.Entities.Game", "Game")
                        .WithMany("Participants")
                        .HasForeignKey("GameId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("MagicStats.Persistence.EfCore.Entities.Player", "Player")
                        .WithMany("Participated")
                        .HasForeignKey("PlayerId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Commander");

                    b.Navigation("Game");

                    b.Navigation("Player");
                });

            modelBuilder.Entity("MagicStats.Persistence.EfCore.Entities.Commander", b =>
                {
                    b.Navigation("Participated");
                });

            modelBuilder.Entity("MagicStats.Persistence.EfCore.Entities.Game", b =>
                {
                    b.Navigation("Participants");
                });

            modelBuilder.Entity("MagicStats.Persistence.EfCore.Entities.Host", b =>
                {
                    b.Navigation("Games");
                });

            modelBuilder.Entity("MagicStats.Persistence.EfCore.Entities.Player", b =>
                {
                    b.Navigation("Participated");
                });
#pragma warning restore 612, 618
        }
    }
}
